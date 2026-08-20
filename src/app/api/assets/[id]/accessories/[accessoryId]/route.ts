import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; accessoryId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_EDIT] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const accessory = await (prisma as any).assetAccessory.findUnique({
      where: { id: params.accessoryId, assetId: params.id },
    });

    if (!accessory) return NextResponse.json({ error: "Accessory not found" }, { status: 404 });

    await (prisma as any).assetAccessory.delete({
      where: { id: params.accessoryId },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.UPDATE,
      module: AUDIT_MODULES.ASSETS,
      entityId: params.id,
      userId: session.user.id,
      details: `Removed accessory: ${accessory.name}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import QRCode from "qrcode";

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string; accessoryId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_EDIT] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();

    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
    });

    const accessory = await (prisma as any).assetAccessory.findUnique({
      where: { id: params.accessoryId, assetId: params.id },
    });

    if (!asset || !accessory) return NextResponse.json({ error: "Not found" }, { status: 404 });

    let qrCodeDataUrl = accessory.qrCode;
    
    if (body.generateQr && !qrCodeDataUrl) {
      const qrData = `Accessory: ${accessory.name} | Asset: ${asset.assetCode} | SN: ${accessory.serialNumber || 'N/A'}`;
      qrCodeDataUrl = await QRCode.toDataURL(qrData);
      
      await (prisma as any).assetAccessory.update({
        where: { id: params.accessoryId },
        data: { qrCode: qrCodeDataUrl },
      });

      await createAuditLog({
        action: AUDIT_ACTIONS.UPDATE,
        module: AUDIT_MODULES.ASSETS,
        entityId: params.id,
        userId: session.user.id,
        details: `Generated QR code for accessory: ${accessory.name}`,
      });
    }

    return NextResponse.json({ success: true, qrCode: qrCodeDataUrl });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
