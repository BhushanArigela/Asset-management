import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";


const amcSchema = z.object({
  vendorId: z.string().min(1, "Provider name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  cost: z.number().optional(),
});

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const amcs = await prisma.assetAmc.findMany({
      where: { assetId: params.id },
      orderBy: { endDate: "desc" },
    });
    return NextResponse.json(amcs);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_EDIT] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const data = amcSchema.parse(body);

    const amc = await prisma.assetAmc.create({
      data: {
        assetId: params.id,
        vendorId: data.vendorId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        cost: data.cost,
      },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.CREATE,
      module: AUDIT_MODULES.ASSETS,
      entityId: params.id,
      userId: session.user.id,
      details: "AMC added",
      newData: amc,
    });

    return NextResponse.json(amc, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return NextResponse.json({ message: "Not fully implemented in this snippet" });
}
