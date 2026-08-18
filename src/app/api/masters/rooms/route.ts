import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import QRCode from "qrcode";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

const createRoomSchema = z.object({
  floorId: z.string().min(1, "Floor is required"),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  roomType: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_VIEW] as any))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const floorId = searchParams.get("floorId");
    
    const where: any = {};
    if (floorId) where.floorId = floorId;

    const items = await prisma.room.findMany({
      where,
      include: { floor: { include: { building: true } } },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ data: items });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_CREATE] as any))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const validatedData = createRoomSchema.parse(body);

    const roomUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/search?roomCode=${validatedData.code}`;
    const qrCode = await QRCode.toDataURL(roomUrl);

    const newItem = await prisma.room.create({ 
      data: { ...validatedData, qrCode } 
    });
    await createAuditLog({ userId: session.user.id, action: AUDIT_ACTIONS.CREATE, module: AUDIT_MODULES.MASTER_DATA, details: `Created room ${newItem.code}`, entityId: newItem.id });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
