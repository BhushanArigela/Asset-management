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
    const userId = searchParams.get("userId");
    const module = searchParams.get("module");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    
    const whereClause: any = {};
    if (userId) whereClause.userId = userId;
    if (module) whereClause.module = module;
    if (action) whereClause.action = action;
    if (entityType) whereClause.entityType = entityType;
    if (dateFrom && dateTo) {
      whereClause.createdAt = {
        gte: new Date(dateFrom),
        lte: new Date(dateTo),
      };
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 200, // Limit for performance on typical views
    });

    const isExcel = searchParams.get("format") === "excel";
    if (isExcel) {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("System Logs");

      worksheet.addRow(["Date", "User", "Module", "Action", "Entity Type", "Entity ID", "IP Address"]);
      
      const headerRow = worksheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: "FF1B2A4A" } };
      headerRow.font.color = { argb: "FFFFFFFF" };

      logs.forEach((log) => {
        worksheet.addRow([
          new Date(log.createdAt).toLocaleString(),
          log.user?.name || log.userId,
          log.module,
          log.action,
          log.entityType,
          log.entityId,
          log.ipAddress
        ]);
      });

      worksheet.columns.forEach(column => { column.width = 20; });

      const buffer = await workbook.xlsx.writeBuffer();
      return new NextResponse(buffer, {
        headers: {
          "Content-Disposition": `attachment; filename="system-audit-logs.xlsx"`,
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error("[AUDIT_LOGS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
