import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { pipeline } from "stream/promises";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_EDIT] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "assets");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const file of files) {
      try {
        // Extract asset code from filename (e.g. "AST-001.jpg" -> "AST-001")
        if (!file.type.startsWith("image/")) {
          failedCount++;
          errors.push(`File ${file.name} is not a valid image format.`);
          continue;
        }

        const ext = path.extname(file.name);
        const assetCode = path.basename(file.name, ext);

        // Find the asset
        const asset = await prisma.asset.findUnique({
          where: { assetCode }
        });

        if (!asset) {
          failedCount++;
          errors.push(`Asset ${assetCode} not found for image ${file.name}`);
          continue;
        }

        // Save file
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const newFileName = `${assetCode}-${uniqueSuffix}${ext}`;
        const filePath = path.join(uploadDir, newFileName);
        
        const buffer = Buffer.from(await file.arrayBuffer());
        fs.writeFileSync(filePath, buffer);

        const imageUrl = `/uploads/assets/${newFileName}`;

        // Update asset
        await prisma.asset.update({
          where: { id: asset.id },
          data: { imageUrl }
        });

        successCount++;
      } catch (err: any) {
        failedCount++;
        errors.push(`Failed to process ${file.name}: ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${files.length} images. ${successCount} successful, ${failedCount} failed.`,
      successCount,
      failedCount,
      errors
    });
  } catch (error: any) {
    console.error("Bulk image upload error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
