import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
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
        auditor: { select: { id: true, name: true } },
        building: { select: { name: true } },
        room: { select: { name: true } },
        auditExpectedAssets: {
          include: {
            asset: { select: { id: true, name: true, assetCode: true, status: true, condition: true, building: { select: { name: true } }, room: { select: { name: true } } } }
          }
        },
        auditResults: {
          include: {
            asset: { select: { id: true, name: true, assetCode: true, condition: { select: { name: true } }, building: { select: { name: true } }, room: { select: { name: true } } } },
            newStatus: { select: { name: true } },
            newCondition: { select: { name: true } },
            scannedBy: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!audit) {
      return new NextResponse("Audit not found", { status: 404 });
    }

    return NextResponse.json(audit);
  } catch (error) {
    console.error("[AUDIT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const auditId = params.id;
    const body = await req.json();
    const { notes } = body;

    const updatedAudit = await prisma.auditSession.update({
      where: { id: auditId },
      data: { notes }
    });

    return NextResponse.json(updatedAudit);
  } catch (error) {
    console.error("[AUDIT_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
