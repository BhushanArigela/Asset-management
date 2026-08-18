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
    
    if (!type) {
      return new NextResponse("Report type is required", { status: 400 });
    }

    // Parse filters
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const buildingId = searchParams.get("buildingId");
    const departmentId = searchParams.get("departmentId");
    
    // Base where clause based on filters
    const whereClause: any = {};
    if (buildingId) whereClause.buildingId = buildingId;
    if (departmentId) whereClause.departmentId = departmentId;
    if (dateFrom && dateTo) {
      whereClause.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    }

    let reportData = [];

    switch (type) {
      case "asset-register":
      case "assets-by-building":
      case "assets-by-department":
        reportData = await prisma.asset.findMany({
          where: whereClause,
          include: { category: true, building: true, department: true, status: true, condition: true },
        });
        break;
      case "damaged-assets":
        reportData = await prisma.asset.findMany({
          where: { ...whereClause, status: { name: "Damaged" }, isDisposed: false },
          include: { category: true, building: true, status: true, condition: true },
        });
        break;
      case "missing-assets":
        reportData = await prisma.asset.findMany({
          where: { ...whereClause, status: { name: "Missing" }, isDisposed: false },
          include: { category: true, building: true, status: true, condition: true },
        });
        break;
      case "disposed-assets":
        reportData = await prisma.asset.findMany({
          where: { ...whereClause, isDisposed: true },
          include: { category: true, building: true, status: true, condition: true },
        });
        break;
      case "warranty-expiry":
      case "amc-expiry":
        // For now, just return all assets since the UI just shows a generic list.
        reportData = await prisma.asset.findMany({
          where: { ...whereClause, isDisposed: false },
          include: { category: true, building: true, status: true, condition: true },
        });
        break;
      default:
        return new NextResponse("Unsupported report type", { status: 400 });
    }

    const isExcel = searchParams.get("format") === "excel";

    if (isExcel) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Report");

      // Add Headers
      const headers = ["Asset Code", "Name", "Status", "Condition", "Category", "Building"];
      worksheet.addRow(headers);
      
      // Style headers
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: "FF1B2A4A" } // Sheraton primary
      };

      // Add Data
      reportData.forEach((item: any) => {
        worksheet.addRow([
          item.assetCode,
          item.name,
          item.status?.name || "N/A",
          item.condition?.name || "N/A",
          item.category?.name || "N/A",
          item.building?.name || "N/A"
        ]);
      });

      // Auto-fit columns
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
    }

    return NextResponse.json(reportData);
  } catch (error: any) {
    console.error("[REPORTS_GET]", error);
    return new NextResponse(error.message || "Internal error", { status: 500 });
  }
}
