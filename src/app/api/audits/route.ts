import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    
    const whereClause: any = {};
    if (status) {
      whereClause.status = status;
    }

    const audits = await prisma.auditSession.findMany({
      where: whereClause,
      include: {
        auditor: { select: { id: true, name: true } }
      },
      orderBy: { auditDate: "desc" },
    });

    return NextResponse.json(audits);
  } catch (error) {
    console.error("[AUDITS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, scopeType, scopeId, auditorId, auditDate, notes } = body;

    if (!name || !scopeType || !auditorId || !auditDate) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Step 1: Query expected assets based on scope
    const assetWhereClause: any = { status: { notIn: ["Disposed", "Sold"] } };
    
    switch(scopeType) {
      case "Building":
        assetWhereClause.buildingId = scopeId;
        break;
      case "Department":
        assetWhereClause.departmentId = scopeId;
        break;
      case "Category":
        assetWhereClause.categoryId = scopeId;
        break;
      // 'Company' or generic doesn't need specific ID if it implies 'all'
    }

    const expectedAssets = await prisma.asset.findMany({
      where: assetWhereClause,
      select: { id: true }
    });

    // Step 2: Create the session and the expected asset list in one transaction
    const newAudit = await prisma.$transaction(async (tx) => {
      const audit = await tx.auditSession.create({
        data: {
          name,
          scopeType,
          scopeId,
          auditorId,
          auditDate: new Date(auditDate),
          notes,
          status: "PLANNED",
          totalExpected: expectedAssets.length,
          totalVerified: 0,
          totalMissing: 0,
          totalWrongLocation: 0,
          totalDamaged: 0,
          totalUnexpected: 0,
          createdById: session.user.id
        }
      });

      if (expectedAssets.length > 0) {
        await tx.auditExpectedAsset.createMany({
          data: expectedAssets?.map(asset => ({
            sessionId: audit.id,
            assetId: asset.id
          }))
        });
      }

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          module: "AUDIT",
          entityType: "AuditSession",
          entityId: audit.id,
          action: "CREATE",
          newValue: { ...audit, expectedAssetsCount: expectedAssets.length },
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        }
      });

      return audit;
    });

    return NextResponse.json(newAudit);
  } catch (error) {
    console.error("[AUDITS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
