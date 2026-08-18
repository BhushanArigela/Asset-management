import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import QRCode from "qrcode";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

const updateSchema = z.object({
  floorId: z.string().optional(),
  name: z.string().optional(),
  code: z.string().optional(),
  roomType: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const item = await prisma.room.findUnique({ where: { id: params.id }, include: { floor: true } });
    return NextResponse.json(item);
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_EDIT] as any))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const validatedData = updateSchema.parse(body);

    // Get current to see if code changed or if QR is missing
    const currentRoom = await prisma.room.findUnique({ where: { id: params.id } });
    if (!currentRoom) return NextResponse.json({ error: "Room not found" }, { status: 404 });

    let qrCode = currentRoom.qrCode;
    // Generate new QR if code changed or QR is missing
    if (validatedData.code && (validatedData.code !== currentRoom.code || !qrCode)) {
      const roomUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/search?roomCode=${validatedData.code}`;
      qrCode = await QRCode.toDataURL(roomUrl);
    }

    const updated = await prisma.room.update({
      where: { id: params.id },
      data: { ...validatedData, qrCode },
    });
    await createAuditLog({ userId: session.user.id, action: AUDIT_ACTIONS.UPDATE, module: AUDIT_MODULES.MASTER_DATA, details: `Updated ${updated.code}`, entityId: updated.id });
    
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_DELETE] as any))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const deleted = await prisma.room.update({ where: { id: params.id }, data: { isActive: false } });
    await createAuditLog({ userId: session.user.id, action: AUDIT_ACTIONS.DELETE, module: AUDIT_MODULES.MASTER_DATA, details: `Deleted ${deleted.code}`, entityId: deleted.id });
    
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
