import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";


const updateMrSchema = z.object({
  status: z.string().optional(),
  resolutionDetails: z.string().optional(),
  cost: z.number().optional(),
  assignedToId: z.string().optional(),
});

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const mr = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
      include: {
        asset: true,
        createdBy: true,
        
      },
    });
    if (!mr) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(mr);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.MAINTENANCE_EDIT] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const data = updateMrSchema.parse(body);

    const updateData: any = { ...data };
    if (data.status === "Completed") {
      updateData.completedDate = new Date();
    }

    const mr = await prisma.maintenanceRequest.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(mr);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
