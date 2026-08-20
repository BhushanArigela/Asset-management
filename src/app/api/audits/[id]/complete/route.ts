import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const auditId = params.id;

    const audit = await prisma.auditSession.findUnique({ 
      where: { id: auditId },
      include: {
        auditExpectedAssets: true,
        auditResults: { 
          include: { asset: true }
        }
      }
    });
    
    if (!audit) return new NextResponse("Audit not found", { status: 404 });
    if (audit.status !== "IN_PROGRESS") return new NextResponse("Audit is not in progress", { status: 400 });

    const scannedAssetIds = new Set(audit.auditResults?.map(r => r.assetId).filter(Boolean));
    
    const missingAssetIds = audit.auditExpectedAssets
      .filter(ea => !scannedAssetIds.has(ea.assetId))
      ?.map(ea => ea.assetId);

    await prisma.$transaction(async (tx) => {
      // Mark missing items
      if (missingAssetIds.length > 0) {
        const missingResults = missingAssetIds?.map(assetId => ({
          sessionId: auditId,
          assetId,
          classification: "MISSING",
          scannedById: session.user.id,
          scannedAt: new Date()
        }));

        await tx.auditResult.createMany({ data: missingResults });
      }

      // Apply new status and conditions
      for (const result of audit.auditResults) {
        if (!result.assetId || !result.asset) continue;

        const updateData: any = {};
        
        if (result.newStatusId && result.newStatusId !== result.asset.statusId) {
          updateData.statusId = result.newStatusId;
          await tx.assetStatusChange.create({
            data: {
              assetId: result.assetId,
              oldStatusId: result.asset.statusId,
              newStatusId: result.newStatusId,
              changedById: session.user.id,
              remarks: "Updated via Audit " + audit.name
            }
          });
        }
        
        if (result.newConditionId && result.newConditionId !== result.asset.conditionId) {
          updateData.conditionId = result.newConditionId;
          await tx.assetConditionChange.create({
            data: {
              assetId: result.assetId,
              oldConditionId: result.asset.conditionId,
              newConditionId: result.newConditionId,
              changedById: session.user.id,
              remarks: "Updated via Audit " + audit.name
            }
          });
        }
        
        if (Object.keys(updateData).length > 0) {
          await tx.asset.update({
            where: { id: result.assetId },
            data: updateData
          });
        }
      }

      // Complete session
      await tx.auditSession.update({
        where: { id: auditId },
        data: { 
          status: "COMPLETED",
          completedAt: new Date(),
          totalMissing: missingAssetIds.length
        }
      });

      // Log it
      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          module: "AUDIT",
          entityType: "AuditSession",
          entityId: auditId,
          action: "UPDATE",
          previousValue: { status: "IN_PROGRESS" },
          newValue: { status: "COMPLETED", missingCount: missingAssetIds.length },
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
          remarks: "Audit completed"
        }
      });
    });

    return NextResponse.json({ success: true, missingCount: missingAssetIds.length });
  } catch (error) {
    console.error("[AUDIT_COMPLETE_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
