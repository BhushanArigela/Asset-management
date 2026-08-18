import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_CREATE] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const autoCreateStr = formData.get("autoCreate") as string;
    const autoCreate = autoCreateStr === "true";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(Buffer.from(buffer));

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return NextResponse.json({ error: "Empty workbook" }, { status: 400 });
    }

    const headers: string[] = [];
    worksheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = cell.value?.toString().trim() || "";
    });

    const getCol = (name: string) => headers.findIndex((h) => h?.includes(name));

    const colIdx = {
      assetCode: getCol("Asset Code"),
      name: getCol("Name"),
      description: getCol("Description"),
      category: getCol("Category Name"),
      subCategory: getCol("Sub Category Name"),
      company: getCol("Company Code"),
      building: getCol("Building Code"),
      floor: getCol("Floor Code"),
      room: getCol("Room Code"),
      department: getCol("Department Code"),
      status: getCol("Status Name"),
      condition: getCol("Condition Name"),
      vendor: getCol("Vendor Code"),
      brand: getCol("Brand Name"),
      model: getCol("Model"),
      serialNumber: getCol("Serial Number"),
      purchaseDate: getCol("Purchase Date"),
      purchaseCost: getCol("Purchase Cost"),
      invoiceRef: getCol("Invoice Ref"),
      warrantyProvider: getCol("Warranty Provider Code"),
      warrantyStart: getCol("Warranty Start"),
      warrantyExpiry: getCol("Warranty Expiry"),
      warrantyRef: getCol("Warranty Ref"),
      amcVendor: getCol("AMC Vendor Code"),
      amcStart: getCol("AMC Start"),
      amcExpiry: getCol("AMC Expiry"),
      amcRef: getCol("AMC Ref"),
      amcValue: getCol("AMC Value"),
    };

    if (colIdx.assetCode === -1 || colIdx.name === -1) {
      return NextResponse.json({ error: "Missing required columns (Asset Code, Name)" }, { status: 400 });
    }

    // Prefetch all master data to map names to IDs
    const [categories, subCategories, companies, buildings, floors, rooms, departments, statuses, conditions, vendors, brands, existingAssets] = await Promise.all([
      prisma.assetCategory.findMany(),
      prisma.assetSubCategory.findMany(),
      prisma.company.findMany(),
      prisma.building.findMany(),
      prisma.floor.findMany(),
      prisma.room.findMany(),
      prisma.department.findMany(),
      prisma.assetStatus.findMany(),
      prisma.assetCondition.findMany(),
      prisma.vendor.findMany(),
      prisma.brand.findMany(),
      prisma.asset.findMany({ select: { assetCode: true } })
    ]);

    const existingAssetCodes = new Set(existingAssets.map(a => a.assetCode));

    const rows: any[] = [];
    let rowIndex = 2; // skip header

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      
      const getVal = (idx: number) => {
        if (idx === -1) return null;
        const val = row.getCell(idx).value;
        return val ? val.toString().trim() : null;
      };

      const assetCode = getVal(colIdx.assetCode);
      if (!assetCode) return; // Skip completely empty rows

      const rowData: any = {
        _rowNumber: rowNumber,
        assetCode,
        name: getVal(colIdx.name),
        description: getVal(colIdx.description),
        category: getVal(colIdx.category),
        subCategory: getVal(colIdx.subCategory),
        company: getVal(colIdx.company),
        building: getVal(colIdx.building),
        floor: getVal(colIdx.floor),
        room: getVal(colIdx.room),
        department: getVal(colIdx.department),
        status: getVal(colIdx.status),
        condition: getVal(colIdx.condition),
        vendor: getVal(colIdx.vendor),
        brand: getVal(colIdx.brand),
        model: getVal(colIdx.model),
        serialNumber: getVal(colIdx.serialNumber),
        purchaseDate: getVal(colIdx.purchaseDate),
        purchaseCost: getVal(colIdx.purchaseCost),
        invoiceRef: getVal(colIdx.invoiceRef),
        warrantyProvider: getVal(colIdx.warrantyProvider),
        warrantyStart: getVal(colIdx.warrantyStart),
        warrantyExpiry: getVal(colIdx.warrantyExpiry),
        warrantyRef: getVal(colIdx.warrantyRef),
        amcVendor: getVal(colIdx.amcVendor),
        amcStart: getVal(colIdx.amcStart),
        amcExpiry: getVal(colIdx.amcExpiry),
        amcRef: getVal(colIdx.amcRef),
        amcValue: getVal(colIdx.amcValue),
        _errors: [] as string[],
        _action: "NEW", // NEW, UPDATE, ERROR
        _resolvedIds: {} as any
      };

      // Validation and Resolution
      if (!rowData.name) rowData._errors.push("Name is required");

      // Category
      if (rowData.category) {
        const cat = categories.find(c => c.name.toLowerCase() === rowData.category.toLowerCase());
        if (cat) rowData._resolvedIds.categoryId = cat.id;
        else if (!autoCreate) rowData._errors.push(`Category '${rowData.category}' not found`);
      } else {
        rowData._errors.push("Category is required");
      }

      // Company
      if (rowData.company) {
        const comp = companies.find(c => c.code.toLowerCase() === rowData.company.toLowerCase());
        if (comp) rowData._resolvedIds.companyId = comp.id;
        else if (!autoCreate) rowData._errors.push(`Company code '${rowData.company}' not found`);
      } else {
        rowData._errors.push("Company Code is required");
      }

      // Status
      if (rowData.status) {
        const stat = statuses.find(s => s.name.toLowerCase() === rowData.status.toLowerCase());
        if (stat) rowData._resolvedIds.statusId = stat.id;
        else if (!autoCreate) rowData._errors.push(`Status '${rowData.status}' not found`);
      } else {
        rowData._errors.push("Status is required");
      }

      // Condition
      if (rowData.condition) {
        const cond = conditions.find(c => c.name.toLowerCase() === rowData.condition.toLowerCase());
        if (cond) rowData._resolvedIds.conditionId = cond.id;
        else if (!autoCreate) rowData._errors.push(`Condition '${rowData.condition}' not found`);
      } else {
        rowData._errors.push("Condition is required");
      }

      // Optional relations
      if (rowData.building) {
        const bld = buildings.find(b => b.code.toLowerCase() === rowData.building.toLowerCase());
        if (bld) rowData._resolvedIds.buildingId = bld.id;
        else if (!autoCreate) rowData._errors.push(`Building code '${rowData.building}' not found`);
      }

      if (rowData.floor) {
        const fl = floors.find(f => f.code.toLowerCase() === rowData.floor.toLowerCase());
        if (fl) rowData._resolvedIds.floorId = fl.id;
        else if (!autoCreate) rowData._errors.push(`Floor code '${rowData.floor}' not found`);
      }

      if (rowData.room) {
        const rm = rooms.find(r => r.code.toLowerCase() === rowData.room.toLowerCase());
        if (rm) rowData._resolvedIds.roomId = rm.id;
        else if (!autoCreate) rowData._errors.push(`Room code '${rowData.room}' not found`);
      }

      if (rowData.brand) {
        // Assuming brand code is name or we check by name
        const br = brands.find(b => b.name.toLowerCase() === rowData.brand.toLowerCase());
        if (br) rowData._resolvedIds.brandId = br.id;
        else if (!autoCreate) rowData._errors.push(`Brand '${rowData.brand}' not found`);
      }

      if (rowData.department) {
        const dep = departments.find(d => d.code.toLowerCase() === rowData.department.toLowerCase());
        if (dep) rowData._resolvedIds.departmentId = dep.id;
        else if (!autoCreate) rowData._errors.push(`Department code '${rowData.department}' not found`);
      }
      
      if (rowData.vendor) {
        const ven = vendors.find(v => v.code.toLowerCase() === rowData.vendor.toLowerCase());
        if (ven) rowData._resolvedIds.vendorId = ven.id;
        else if (!autoCreate) rowData._errors.push(`Vendor code '${rowData.vendor}' not found`);
      }

      if (rowData.warrantyProvider) {
        const ven = vendors.find(v => v.code.toLowerCase() === rowData.warrantyProvider.toLowerCase());
        if (ven) rowData._resolvedIds.warrantyProviderId = ven.id;
        else if (!autoCreate) rowData._errors.push(`Warranty Provider code '${rowData.warrantyProvider}' not found`);
      }

      if (rowData.amcVendor) {
        const ven = vendors.find(v => v.code.toLowerCase() === rowData.amcVendor.toLowerCase());
        if (ven) rowData._resolvedIds.amcVendorId = ven.id;
        else if (!autoCreate) rowData._errors.push(`AMC Vendor code '${rowData.amcVendor}' not found`);
      }

      // Date validation
      if (!rowData._warnings) rowData._warnings = [];
      const validateDate = (val: string, label: string) => {
        if (!val) return;
        const d = new Date(val);
        if (isNaN(d.getTime())) {
          rowData._warnings.push(`Invalid ${label} date format: ${val}. This date will be ignored.`);
        }
      };

      validateDate(rowData.warrantyStart, "Warranty Start");
      validateDate(rowData.warrantyExpiry, "Warranty Expiry");
      validateDate(rowData.amcStart, "AMC Start");
      validateDate(rowData.amcExpiry, "AMC Expiry");

      // Duplicate Check
      if (existingAssetCodes.has(assetCode)) {
        // If user has edit permissions, they can update
        const canEdit = hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_EDIT] as any);
        if (canEdit) {
          rowData._action = "UPDATE";
        } else {
          rowData._errors.push(`Asset code '${assetCode}' already exists and you lack UPDATE permissions`);
        }
      }

      if (rowData._errors.length > 0) {
        rowData._action = "ERROR";
      }

      rows.push(rowData);
    });

    const summary = {
      total: rows.length,
      new: rows.filter(r => r._action === "NEW").length,
      update: rows.filter(r => r._action === "UPDATE").length,
      error: rows.filter(r => r._action === "ERROR").length,
    };

    return NextResponse.json({ rows, summary });
  } catch (error) {
    console.error("Preview error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
