import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

const createBuildingSchema = z.object({
  companyId: z.string().min(1, "Company is required"),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!(hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_VIEW] as any))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");
    
    const where: any = {};
    if (companyId) where.companyId = companyId;

    const items = await prisma.building.findMany({
      where,
      include: { company: true },
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
    const validatedData = createBuildingSchema.parse(body);

    const newItem = await prisma.building.create({ data: validatedData });
    await createAuditLog({ userId: session.user.id, action: AUDIT_ACTIONS.CREATE, module: AUDIT_MODULES.MASTER_DATA, details: `Created building ${newItem.code}`, entityId: newItem.id });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
