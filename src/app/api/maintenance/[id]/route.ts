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
  notes: z.string().optional(),
});

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const mr = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
      include: {
        asset: true,
        createdBy: true,
        updates: {
          include: {
            createdBy: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
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
    delete updateData.notes;

    if (data.status === "COMPLETED") {
      updateData.resolution = data.resolutionDetails;
    }

    const existingMr = await prisma.maintenanceRequest.findUnique({
      where: { id: params.id },
      include: { asset: true }
    });

    if (!existingMr) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const mr = await prisma.maintenanceRequest.update({
      where: { id: params.id },
      data: updateData,
    });

    if (data.status === "COMPLETED" || data.status === "CANCELLED") {
      const activeStatus = await prisma.assetStatus.findFirst({
        where: { name: { equals: "Active", mode: "insensitive" } }
      });
      if (activeStatus && existingMr.asset.statusId !== activeStatus.id) {
        await prisma.asset.update({
          where: { id: existingMr.assetId },
          data: { statusId: activeStatus.id }
        });

        await prisma.assetStatusChange.create({
          data: {
            assetId: existingMr.assetId,
            oldStatusId: existingMr.asset.statusId,
            newStatusId: activeStatus.id,
            reason: `Maintenance marked as ${data.status}`,
            changedById: session.user.id
          }
        });
      }
    }

    if (data.notes || data.status) {
      await prisma.maintenanceUpdate.create({
        data: {
          maintenanceId: params.id,
          notes: data.notes || `Status changed to ${data.status}`,
          statusChangedTo: data.status,
          createdById: session.user.id,
        }
      });
    }

    return NextResponse.json(mr);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
