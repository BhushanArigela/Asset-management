import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";


const warrantySchema = z.object({
  vendorId: z.string().min(1, "Provider name is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  terms: z.string().optional(),
});

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const warranties = await prisma.assetWarranty.findMany({
      where: { assetId: params.id },
      orderBy: { endDate: "desc" },
    });
    return NextResponse.json(warranties);
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
    const data = warrantySchema.parse(body);

    const warranty = await prisma.assetWarranty.create({
      data: {
        assetId: params.id,
        vendorId: data.vendorId,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        terms: data.terms,
      },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.CREATE,
      module: AUDIT_MODULES.ASSETS,
      entityId: params.id,
      userId: session.user.id,
      details: "Warranty added",
      newData: warranty,
    });

    return NextResponse.json(warranty, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  // Simple implementation for update
  return NextResponse.json({ message: "Not fully implemented in this snippet" });
}
