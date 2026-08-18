import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";

import fs from "fs/promises";
import path from "path";

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string; docId: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_EDIT] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const document = await prisma.assetDocument.findUnique({
      where: { id: params.docId },
    });

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    if (document.assetId !== params.id) {
      return NextResponse.json({ error: "Document does not belong to this asset" }, { status: 400 });
    }

    try {
      const filePath = path.join(process.cwd(), "public", document.fileUrl);
      await fs.unlink(filePath);
    } catch (e) {
      console.warn("File not found on disk or could not be deleted:", e);
    }

    await prisma.assetDocument.delete({
      where: { id: params.docId },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.DELETE,
      module: AUDIT_MODULES.ASSETS,
      entityId: params.id,
      userId: session.user.id,
      details: `Document ${document.name} deleted`,
      oldData: document,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
