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
    const body = await req.json();
    const { assetCode, classification, physicalCondition, remarks, photoPath } = body;

    if (!assetCode || !classification) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const audit = await prisma.auditSession.findUnique({ where: { id: auditId } });
    if (!audit) return new NextResponse("Audit not found", { status: 404 });
    if (audit.status !== "IN_PROGRESS") return new NextResponse("Audit is not in progress", { status: 400 });

    const asset = await prisma.asset.findUnique({ where: { assetCode } });
    if (!asset) {
      return new NextResponse("Asset not found in system", { status: 404 });
    }

    const isExpected = await prisma.auditExpectedAsset.findUnique({
      where: {
        sessionId_assetId: { sessionId: auditId, assetId: asset.id }
      }
    });

    // Determine final classification if unexpected
    const finalClassification = isExpected ? classification : "UNEXPECTED";

    // Record the scan result
    const result = await prisma.$transaction(async (tx) => {
      const scan = await tx.auditResult.create({
        data: {
          sessionId: auditId,
          assetId: asset.id,
          assetCode: asset.assetCode,
          classification: finalClassification,
          physicalCondition,
          remarks,
          photoPath,
          scannedById: session.user.id,
        scannedAt: new Date(),
        }
      });

      // Update counters on session
      const incrementField = 
        finalClassification === "VERIFIED" ? "totalVerified" :
        finalClassification === "WRONG_LOCATION" ? "totalWrongLocation" :
        finalClassification === "DAMAGED" ? "totalDamaged" :
        "totalUnexpected";

      await tx.auditSession.update({
        where: { id: auditId },
        data: { [incrementField]: { increment: 1 } }
      });

      return scan;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[AUDIT_SCAN_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
