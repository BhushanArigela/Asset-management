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
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_EDIT] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const description = formData.get("description") as string;
    const file = formData.get("file") as File | null;

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 });
    }

    // Get the Damaged status ID
    const damagedStatus = await prisma.assetStatus.findFirst({
      where: { name: "Damaged" },
    });

    if (!damagedStatus) {
      return NextResponse.json({ error: "Damaged status not configured in system" }, { status: 500 });
    }

    // Get the current asset status
    const currentAsset = await prisma.asset.findUnique({
      where: { id: params.id },
      select: { statusId: true }
    });

    if (!currentAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    let fileUrl = null;
    let documentRecord = null;

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadDir = path.join(process.cwd(), "public", "uploads", "assets", params.id);
      await fs.mkdir(uploadDir, { recursive: true });

      const fileName = `${Date.now()}-damage-${file.name}`;
      const filePath = path.join(uploadDir, fileName);
      await fs.writeFile(filePath, buffer);

      fileUrl = `/uploads/assets/${params.id}/${fileName}`;

      documentRecord = await prisma.assetDocument.create({
        data: {
          assetId: params.id,
          originalName: file.name,
          fileName: fileName,
          documentType: "Damage Report",
          filePath: fileUrl,
          fileSize: file.size,
          mimeType: file.type,
          uploadedById: session.user.id,
        },
      });
    }

    // Perform the status change within a transaction
    const [statusChange, updatedAsset] = await prisma.$transaction([
      prisma.assetStatusChange.create({
        data: {
          assetId: params.id,
          oldStatusId: currentAsset.statusId,
          newStatusId: damagedStatus.id,
          changedById: session.user.id,
          remarks: description,
        }
      }),
      prisma.asset.update({
        where: { id: params.id },
        data: { statusId: damagedStatus.id }
      })
    ]);

    await createAuditLog({
      action: AUDIT_ACTIONS.UPDATE,
      module: AUDIT_MODULES.ASSETS,
      entityId: params.id,
      userId: session.user.id,
      details: `Asset reported as damaged`,
      newData: updatedAsset,
    });

    return NextResponse.json({ success: true, asset: updatedAsset, document: documentRecord }, { status: 200 });
  } catch (error) {
    console.error("Error reporting damage:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
