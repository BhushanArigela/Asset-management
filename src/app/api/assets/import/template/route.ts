import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import ExcelJS from "exceljs";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_CREATE] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Import Template");

    worksheet.columns = [
      { header: "Asset Code*", key: "assetCode", width: 20 },
      { header: "Name*", key: "name", width: 30 },
      { header: "Description", key: "description", width: 40 },
      { header: "Category Name*", key: "category", width: 25 },
      { header: "Sub Category Name", key: "subCategory", width: 25 },
      { header: "Company Code*", key: "company", width: 20 },
      { header: "Building Code", key: "building", width: 20 },
      { header: "Floor Code", key: "floor", width: 15 },
      { header: "Room Code", key: "room", width: 15 },
      { header: "Department Code", key: "department", width: 20 },
      { header: "Status Name*", key: "status", width: 15 },
      { header: "Condition Name*", key: "condition", width: 15 },
      { header: "Vendor Code", key: "vendor", width: 20 },
      { header: "Brand Name", key: "brand", width: 20 },
      { header: "Model", key: "model", width: 20 },
      { header: "Serial Number", key: "serialNumber", width: 25 },
      { header: "Purchase Date (YYYY-MM-DD)", key: "purchaseDate", width: 25 },
      { header: "Purchase Cost", key: "purchaseCost", width: 15 },
      { header: "Invoice Ref", key: "invoiceRef", width: 20 },
      { header: "Warranty Provider Code", key: "warrantyProvider", width: 25 },
      { header: "Warranty Start (YYYY-MM-DD)", key: "warrantyStart", width: 30 },
      { header: "Warranty Expiry (YYYY-MM-DD)", key: "warrantyExpiry", width: 30 },
      { header: "Warranty Ref", key: "warrantyRef", width: 20 },
      { header: "AMC Vendor Code", key: "amcVendor", width: 20 },
      { header: "AMC Start (YYYY-MM-DD)", key: "amcStart", width: 25 },
      { header: "AMC Expiry (YYYY-MM-DD)", key: "amcExpiry", width: 25 },
      { header: "AMC Ref", key: "amcRef", width: 20 },
      { header: "AMC Value", key: "amcValue", width: 15 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE0E0E0" } };

    // Add a sample row to guide users
    worksheet.addRow({
      assetCode: "AST-SAMPLE-001",
      name: "Dell XPS 15",
      description: "Developer laptop",
      category: "Electronics",
      subCategory: "Laptops",
      company: "HQ-01",
      building: "BLD-A",
      floor: "FL-1",
      room: "RM-101",
      department: "IT-01",
      status: "Active",
      condition: "Good",
      vendor: "VEN-DELL",
      brand: "Dell",
      model: "XPS 15 9500",
      serialNumber: "SN123456789",
      purchaseDate: "2024-01-15",
      purchaseCost: 1500,
      invoiceRef: "INV-2024-001",
      warrantyProvider: "VEN-DELL",
      warrantyStart: "2024-01-15",
      warrantyExpiry: "2027-01-14",
      warrantyRef: "WR-12345",
      amcVendor: "VEN-DELL",
      amcStart: "2027-01-15",
      amcExpiry: "2030-01-14",
      amcRef: "AMC-54321",
      amcValue: 500,
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename=asset-import-template.xlsx`,
      },
    });
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
