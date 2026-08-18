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

    const audit = await prisma.auditSession.findUnique({ where: { id: auditId } });
    if (!audit) return new NextResponse("Audit not found", { status: 404 });
    if (audit.status !== "PLANNED") return new NextResponse("Audit cannot be started", { status: 400 });

    const updatedAudit = await prisma.auditSession.update({
      where: { id: auditId },
      data: { status: "IN_PROGRESS" }
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        module: "AUDIT",
        entityType: "AuditSession",
        entityId: auditId,
        action: "UPDATE",
        previousValue: { status: "PLANNED" },
        newValue: { status: "IN_PROGRESS" },
        ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        remarks: "Audit started"
      }
    });

    return NextResponse.json(updatedAudit);
  } catch (error) {
    console.error("[AUDIT_START_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
