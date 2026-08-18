import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

const createFloorSchema = z.object({
  buildingId: z.string().min(1, "Building is required"),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  sortOrder: z.number().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_VIEW] as any))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const buildingId = searchParams.get("buildingId");
    
    const where: any = {};
    if (buildingId) where.buildingId = buildingId;

    const items = await prisma.floor.findMany({
      where,
      include: { building: true },
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
    const validatedData = createFloorSchema.parse(body);

    const newItem = await prisma.floor.create({ data: validatedData });
    await createAuditLog({ userId: session.user.id, action: AUDIT_ACTIONS.CREATE, module: AUDIT_MODULES.MASTER_DATA, details: `Created floor ${newItem.code}`, entityId: newItem.id });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
