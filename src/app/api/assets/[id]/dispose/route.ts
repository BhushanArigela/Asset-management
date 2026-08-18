import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";


const disposeSchema = z.object({
  disposalDate: z.string().min(1, "Disposal date is required"),
  reason: z.string().min(1, "Reason is required"),
  method: z.string().min(1, "Method is required"),
  value: z.number().optional().nullable(),
  approvalRef: z.string().optional().nullable(),
  remarks: z.string().optional().nullable(),
});

export async function POST(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_DELETE] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const data = disposeSchema.parse(body);

    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      include: { status: true }
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    if (asset.isDisposed) {
      return NextResponse.json({ error: "Asset is already disposed" }, { status: 400 });
    }

    let disposedStatus = await prisma.assetStatus.findFirst({
      where: { name: "Disposed" }
    });

    if (!disposedStatus) {
      disposedStatus = await prisma.assetStatus.create({
        data: {
          name: "Disposed",
          colorCode: "#ef4444", // Red
          description: "Asset has been disposed",
          sortOrder: 999,
        }
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const disposal = await tx.assetDisposal.create({
        data: {
          assetId: params.id,
          disposalDate: new Date(data.disposalDate),
          reason: data.reason,
          method: data.method,
          value: data.value ?? null,
          approvalRef: data.approvalRef ?? null,
          remarks: data.remarks ?? null,
          disposedById: session.user.id,
        },
      });

      const updatedAsset = await tx.asset.update({
        where: { id: params.id },
        data: {
          isDisposed: true,
          statusId: disposedStatus.id,
        },
      });

      await tx.assetStatusChange.create({
        data: {
          assetId: params.id,
          oldStatusId: asset.statusId,
          newStatusId: disposedStatus.id,
          remarks: `Asset disposed: ${data.reason}`,
          changedById: session.user.id,
        },
      });

      return { disposal, updatedAsset };
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.DISPOSE,
      module: AUDIT_MODULES.ASSETS,
      entityId: params.id,
      userId: session.user.id,
      details: `Asset disposed. Ref: ${data.approvalRef}`,
      oldData: { isDisposed: false, statusId: asset.statusId },
      newData: { isDisposed: true, statusId: disposedStatus.id },
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error disposing asset:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
