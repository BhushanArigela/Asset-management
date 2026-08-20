import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_VIEW] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    
    const whereClause =
      search && search !== ""
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { assetCode: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { serialNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {};

    const assets = await prisma.asset.findMany({
      where: whereClause,
      include: {
        category: true,
        company: true,
        building: true,
        floor: true,
        department: true,
        status: true,
        condition: true,
        vendor: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Assets");

    worksheet.columns = [
      { header: "Asset Code", key: "assetCode", width: 20 },
      { header: "Name", key: "name", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Category", key: "category", width: 20 },
      { header: "Company", key: "company", width: 25 },
      { header: "Building", key: "building", width: 20 },
      { header: "Floor", key: "floor", width: 15 },
      { header: "Department", key: "department", width: 20 },
      { header: "Status", key: "status", width: 15 },
      { header: "Condition", key: "condition", width: 15 },
      { header: "Vendor", key: "vendor", width: 25 },
      { header: "Purchase Cost", key: "purchaseCost", width: 15 },
      { header: "Purchase Date", key: "purchaseDate", width: 20 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };

    assets.forEach((asset) => {
      worksheet.addRow({
        assetCode: asset.assetCode,
        name: asset.name,
        description: asset.description || "",
        category: asset.category.name,
        company: asset.company.name,
        building: asset.building?.name || "",
        floor: asset.floor?.name || "",
        department: asset.department?.name || "",
        status: asset.status.name,
        condition: asset.condition.name,
        vendor: asset.vendor?.name || "",
        purchaseCost: asset.purchaseCost ? Number(asset.purchaseCost) : "",
        purchaseDate: asset.purchaseDate ? asset.purchaseDate.toISOString().split("T")[0] : "",
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=assets-export-${new Date().toISOString().split("T")[0]}.xlsx`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
