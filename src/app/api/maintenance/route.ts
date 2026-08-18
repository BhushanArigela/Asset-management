import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

const mrSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  problemDescription: z.string().min(1, "Problem description is required"),
  priority: z.string().min(1, "Priority is required"),
  assignedToId: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.MAINTENANCE_VIEW] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const requests = await prisma.maintenanceRequest.findMany({
      include: {
        asset: { select: { assetCode: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.CREATE_MAINTENANCE] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const data = mrSchema.parse(body);

    const todayCount = await prisma.maintenanceRequest.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const sequence = String(todayCount + 1).padStart(4, "0");
    const datePrefix = new Date().toISOString().slice(0,10).replace(/-/g, "");
    const requestNumber = `MR-${datePrefix}-${sequence}`;

    const mr = await prisma.maintenanceRequest.create({
      data: {
        requestNumber: `MR-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-${Math.floor(Math.random() * 10000)}`,
        assetId: data.assetId,
        description: data.problemDescription,
        priority: data.priority,
        status: "Open",
        createdById: session.user.id,
      },
    });

    return NextResponse.json(mr, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
