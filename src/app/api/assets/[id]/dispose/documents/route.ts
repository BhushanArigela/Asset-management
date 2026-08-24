import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import fs from "fs/promises";
import path from "path";

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
    
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_DISPOSE] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const documentType = formData.get("documentType") as string || "Disposal Document";

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const assetDisposal = await prisma.assetDisposal.findUnique({
      where: { assetId: params.id },
    });

    if (!assetDisposal) {
      return NextResponse.json({ error: "Disposal record not found for this asset" }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = path.join(process.cwd(), "public", "uploads", "disposals", assetDisposal.id);
    await fs.mkdir(uploadDir, { recursive: true });

    const fileName = `${Date.now()}-${file.name}`;
    const filePath = path.join(uploadDir, fileName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/disposals/${assetDisposal.id}/${fileName}`;

    const document = await prisma.disposalDocument.create({
      data: {
        disposalId: assetDisposal.id,
        originalName: file.name,
        fileName: fileName,
        filePath: fileUrl,
        fileSize: file.size,
        mimeType: file.type,
        uploadedById: session.user.id,
      },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.CREATE,
      module: AUDIT_MODULES.DISPOSAL,
      entityId: assetDisposal.id,
      userId: session.user.id,
      details: `Disposal document ${file.name} uploaded`,
      newData: document,
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error uploading disposal document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
