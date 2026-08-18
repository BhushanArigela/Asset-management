import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ExcelJS from "exceljs";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    
    // Default logic matching /api/reports since export should yield similar structure
    let reportData = [];
    
    // We can replicate the standard report fetch here
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const buildingId = searchParams.get("buildingId");
    const departmentId = searchParams.get("departmentId");
    
    const whereClause: any = {};
    if (buildingId && buildingId !== "all") whereClause.buildingId = buildingId;
    if (departmentId && departmentId !== "all") whereClause.departmentId = departmentId;
    if (dateFrom && dateTo) {
      whereClause.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    }

    switch (type) {
      case "asset-register":
        reportData = await prisma.asset.findMany({ where: whereClause, include: { category: true, building: true } });
        break;
      case "damaged-assets":
        reportData = await prisma.asset.findMany({ where: { ...whereClause, condition: "Damaged" }, include: { category: true, building: true } });
        break;
      case "missing-assets":
        reportData = await prisma.asset.findMany({ where: { ...whereClause, status: "Missing" }, include: { category: true, building: true } });
        break;
      default:
        reportData = await prisma.asset.findMany({ where: whereClause, include: { category: true, building: true } });
        break;
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(type ? type.replace(/-/g, " ").toUpperCase() : "Report");

    // Add Headers
    const headers = ["Asset Code", "Name", "Status", "Condition", "Category", "Building", "Added Date"];
    worksheet.addRow(headers);
    
    // Style headers
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: "FF1B2A4A" } 
    };

    // Add Data
    reportData.forEach((item: any) => {
      worksheet.addRow([
        item.assetCode,
        item.name,
        item.status,
        item.condition,
        item.category?.name || "N/A",
        item.building?.name || "N/A",
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "N/A"
      ]);
    });

    worksheet.columns.forEach(column => {
      column.width = 20;
    });

    const buffer = await workbook.xlsx.writeBuffer();
    
    return new NextResponse(buffer, {
      headers: {
        "Content-Disposition": `attachment; filename="${type}-report.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });

  } catch (error) {
    console.error("[REPORTS_EXPORT]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
