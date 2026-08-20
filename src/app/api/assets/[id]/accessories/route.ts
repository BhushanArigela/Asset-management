import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import QRCode from "qrcode";

const accessorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  serialNumber: z.string().optional(),
  generateQr: z.boolean().default(false),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_VIEW] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const accessories = await (prisma as any).assetAccessory.findMany({
      where: { assetId: params.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(accessories);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_EDIT] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const data = accessorySchema.parse(body);

    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
    });

    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    
    let qrCodeDataUrl = null;
    if (data.generateQr) {
      // Create a unique identifier or URL for the accessory. 
      // For now, we can just encode the accessory name and asset code.
      const qrData = `Accessory: ${data.name} | Asset: ${asset.assetCode} | SN: ${data.serialNumber || 'N/A'}`;
      qrCodeDataUrl = await QRCode.toDataURL(qrData);
    }

    const accessory = await (prisma as any).assetAccessory.create({
      data: {
        assetId: params.id,
        name: data.name,
        serialNumber: data.serialNumber || null,
        qrCode: qrCodeDataUrl,
      },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.UPDATE,
      module: AUDIT_MODULES.ASSETS,
      entityId: params.id,
      userId: session.user.id,
      details: `Added accessory: ${accessory.name}`,
    });

    return NextResponse.json(accessory, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
