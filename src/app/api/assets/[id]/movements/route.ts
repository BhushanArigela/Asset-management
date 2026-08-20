import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";


const movementSchema = z.object({
  toCompanyId: z.string().min(1),
  toBuildingId: z.string().min(1),
  toFloorId: z.string().min(1),
  toRoomId: z.string().min(1),
  toDepartmentId: z.string().optional(),
  toResponsiblePerson: z.string().optional(),
  reason: z.string().min(1),
  remarks: z.string().optional(),
});

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const movements = await prisma.assetMovement.findMany({
      where: { assetId: params.id },
      include: {
        fromBuilding: true,
        toBuilding: true,
        fromFloor: true,
        toFloor: true,
        fromRoom: true,
        toRoom: true,
        transferredBy: true,
      },
      orderBy: { transferDate: "desc" },
    });
    return NextResponse.json(movements);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    console.log("DEBUG MOVEMENTS_CREATE:", PERMISSIONS.MOVEMENTS_CREATE);
    console.log("DEBUG USER PERMS:", session.user.permissions);
    
    if (!hasPermission(session.user.permissions, [PERMISSIONS.MOVEMENTS_CREATE] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await req.json();
    const data = movementSchema.parse(body);

    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
    });

    if (!asset) return NextResponse.json({ error: "Asset not found" }, { status: 404 });

    const result = await prisma.$transaction(async (tx) => {
      const movement = await tx.assetMovement.create({
        data: {
          assetId: params.id,
          fromCompanyId: asset.companyId,
          fromBuildingId: asset.buildingId,
          fromFloorId: asset.floorId,
          fromRoomId: asset.roomId,
          fromDepartmentId: asset.departmentId,
          fromResponsiblePerson: asset.responsiblePerson,
          toCompanyId: data.toCompanyId,
          toBuildingId: data.toBuildingId,
          toFloorId: data.toFloorId,
          toRoomId: data.toRoomId === "" ? null : data.toRoomId,
          toDepartmentId: data.toDepartmentId === "" ? null : data.toDepartmentId,
          toResponsiblePerson: data.toResponsiblePerson === "" ? null : data.toResponsiblePerson,
          reason: data.reason,
          remarks: data.remarks,
          transferredById: session.user.id,
          transferDate: new Date(),
        },
      });

      const updatedAsset = await tx.asset.update({
        where: { id: params.id },
        data: {
          companyId: data.toCompanyId,
          buildingId: data.toBuildingId,
          floorId: data.toFloorId,
          roomId: data.toRoomId === "" ? null : data.toRoomId,
          departmentId: data.toDepartmentId === "" ? null : data.toDepartmentId,
          responsiblePerson: data.toResponsiblePerson === "" ? null : data.toResponsiblePerson,
        },
      });

      return { movement, updatedAsset };
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.UPDATE,
      module: AUDIT_MODULES.ASSETS,
      entityId: params.id,
      userId: session.user.id,
      details: `Asset transferred. Reason: ${data.reason}`,
      oldData: asset,
      newData: result.updatedAsset,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
