import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_CREATE] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { rows, fileName, autoCreate } = await req.json();

    if (!rows || !Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ error: "No rows to import" }, { status: 400 });
    }

    const validRows = rows.filter((r) => r._action === "NEW" || r._action === "UPDATE");
    
    if (validRows.length === 0) {
      return NextResponse.json({ error: "No valid rows to import" }, { status: 400 });
    }

    // Create the ImportLog
    const importLog = await prisma.importLog.create({
      data: {
        fileName: fileName || "Unknown",
        initiatedById: session.user.id,
        totalRecords: rows.length,
        status: "PROCESSING",
      }
    });

    let successCount = 0;
    let failedCount = 0;
    const errorDetails: string[] = [];

    for (const row of validRows) {
      try {
        const purchaseCost = row.purchaseCost ? parseFloat(row.purchaseCost) : null;
        const purchaseDate = row.purchaseDate ? new Date(row.purchaseDate) : null;

        if (autoCreate && !row._resolvedIds.categoryId && row.category) {
          let cat = await prisma.assetCategory.findFirst({ where: { name: row.category }});
          if (!cat) {
            const baseCode = row.category.substring(0, 3).toUpperCase();
            const count = await prisma.assetCategory.count({ where: { code: { startsWith: baseCode } }});
            cat = await prisma.assetCategory.create({ data: { name: row.category, code: `${baseCode}-${count + 1}` }});
          }
          row._resolvedIds.categoryId = cat.id;
        }
        if (autoCreate && !row._resolvedIds.companyId && row.company) {
          let comp = await prisma.company.findFirst({ where: { code: row.company }});
          if (!comp) comp = await prisma.company.create({ data: { name: row.company, code: row.company }});
          row._resolvedIds.companyId = comp.id;
        }
        if (autoCreate && !row._resolvedIds.statusId && row.status) {
          let stat = await prisma.assetStatus.findFirst({ where: { name: row.status }});
          if (!stat) stat = await prisma.assetStatus.create({ data: { name: row.status }});
          row._resolvedIds.statusId = stat.id;
        }
        if (autoCreate && !row._resolvedIds.conditionId && row.condition) {
          let cond = await prisma.assetCondition.findFirst({ where: { name: row.condition }});
          if (!cond) cond = await prisma.assetCondition.create({ data: { name: row.condition }});
          row._resolvedIds.conditionId = cond.id;
        }
        if (autoCreate && !row._resolvedIds.buildingId && row.building && row._resolvedIds.companyId) {
          let bld = await prisma.building.findFirst({ where: { code: row.building, companyId: row._resolvedIds.companyId }});
          if (!bld) bld = await prisma.building.create({ data: { name: row.building, code: row.building, companyId: row._resolvedIds.companyId }});
          row._resolvedIds.buildingId = bld.id;
        }
        if (autoCreate && !row._resolvedIds.floorId && row.floor && row._resolvedIds.buildingId) {
          let fl = await prisma.floor.findFirst({ where: { code: row.floor, buildingId: row._resolvedIds.buildingId }});
          if (!fl) fl = await prisma.floor.create({ data: { name: row.floor, code: row.floor, buildingId: row._resolvedIds.buildingId }});
          row._resolvedIds.floorId = fl.id;
        }
        if (autoCreate && !row._resolvedIds.roomId && row.room && row._resolvedIds.floorId) {
          let rm = await prisma.room.findFirst({ where: { code: row.room, floorId: row._resolvedIds.floorId }});
          if (!rm) rm = await prisma.room.create({ data: { name: row.room, code: row.room, floorId: row._resolvedIds.floorId }});
          row._resolvedIds.roomId = rm.id;
        }
        if (autoCreate && !row._resolvedIds.brandId && row.brand) {
          let br = await prisma.brand.findFirst({ where: { name: row.brand }});
          if (!br) br = await prisma.brand.create({ data: { name: row.brand }});
          row._resolvedIds.brandId = br.id;
        }
        if (autoCreate && !row._resolvedIds.departmentId && row.department) {
          let dep = await prisma.department.findFirst({ where: { code: row.department }});
          if (!dep) dep = await prisma.department.create({ data: { name: row.department, code: row.department }});
          row._resolvedIds.departmentId = dep.id;
        }
        if (autoCreate && !row._resolvedIds.vendorId && row.vendor) {
          let ven = await prisma.vendor.findFirst({ where: { code: row.vendor }});
          if (!ven) ven = await prisma.vendor.create({ data: { name: row.vendor, code: row.vendor }});
          row._resolvedIds.vendorId = ven.id;
        }

        const assetData: any = {
          assetCode: row.assetCode,
          name: row.name,
          description: row.description || null,
          categoryId: row._resolvedIds.categoryId,
          companyId: row._resolvedIds.companyId,
          statusId: row._resolvedIds.statusId,
          conditionId: row._resolvedIds.conditionId,
          buildingId: row._resolvedIds.buildingId || null,
          floorId: row._resolvedIds.floorId || null,
          roomId: row._resolvedIds.roomId || null,
          brandId: row._resolvedIds.brandId || null,
          departmentId: row._resolvedIds.departmentId || null,
          vendorId: row._resolvedIds.vendorId || null,
          model: row.model || null,
          serialNumber: row.serialNumber || null,
          purchaseCost: isNaN(purchaseCost as any) ? null : purchaseCost,
          purchaseDate: purchaseDate && !isNaN(purchaseDate.getTime()) ? purchaseDate : null,
          invoiceRef: row.invoiceRef || null,
          warrantyApplicable: !!row._resolvedIds.warrantyProviderId,
          amcApplicable: !!row._resolvedIds.amcVendorId,
        };

        let warrantyProviderId = row._resolvedIds.warrantyProviderId;
        if (!warrantyProviderId && autoCreate && row.warrantyProvider) {
          let wp = await prisma.vendor.findFirst({ where: { code: row.warrantyProvider }});
          if (!wp) wp = await prisma.vendor.create({ data: { name: row.warrantyProvider, code: row.warrantyProvider }});
          warrantyProviderId = wp.id;
        }

        let amcVendorId = row._resolvedIds.amcVendorId;
        if (!amcVendorId && autoCreate && row.amcVendor) {
          let av = await prisma.vendor.findFirst({ where: { code: row.amcVendor }});
          if (!av) av = await prisma.vendor.create({ data: { name: row.amcVendor, code: row.amcVendor }});
          amcVendorId = av.id;
        }

        const isValidDate = (d: any) => d && !isNaN(new Date(d).getTime());

        if (warrantyProviderId && isValidDate(row.warrantyStart) && isValidDate(row.warrantyExpiry)) {
          assetData.assetWarranties = {
            create: {
              providerVendorId: warrantyProviderId,
              startDate: new Date(row.warrantyStart),
              expiryDate: new Date(row.warrantyExpiry),
              reference: row.warrantyRef || null,
            }
          };
        }

        if (amcVendorId && isValidDate(row.amcStart) && isValidDate(row.amcExpiry)) {
          assetData.assetAmcs = {
            create: {
              vendorId: amcVendorId,
              startDate: new Date(row.amcStart),
              expiryDate: new Date(row.amcExpiry),
              contractRef: row.amcRef || null,
              value: row.amcValue && !isNaN(parseFloat(row.amcValue)) ? parseFloat(row.amcValue) : null,
            }
          };
        }

        if (row._action === "NEW") {
          await prisma.asset.create({
            data: {
              ...assetData,
              createdById: session.user.id,
            }
          });
        } else if (row._action === "UPDATE") {
          if (assetData.assetWarranties) {
            await prisma.assetWarranty.deleteMany({ where: { asset: { assetCode: row.assetCode } } });
          }
          if (assetData.assetAmcs) {
            await prisma.assetAmc.deleteMany({ where: { asset: { assetCode: row.assetCode } } });
          }
          await prisma.asset.update({
            where: { assetCode: row.assetCode },
            data: assetData
          });
        }
        successCount++;
      } catch (err: any) {
        console.error(`Failed to process row ${row.assetCode}`, err);
        failedCount++;
        errorDetails.push(`Row ${row.assetCode}: ${err.message || String(err)}`);
      }
    }

    // Update ImportLog
    if (importLog) {
      await prisma.importLog.update({
        where: { id: importLog.id },
        data: {
          successfulRecords: successCount,
          failedRecords: failedCount,
          status: failedCount === 0 ? "COMPLETED" : "PARTIAL",
          completedAt: new Date(),
        }
      });
    }

    return NextResponse.json({
      success: true,
      totalRecords: rows.filter((r: any) => r._action !== "ERROR").length,
      successfulRecords: successCount,
      failedRecords: failedCount,
      errors: errorDetails
    });
  } catch (error: any) {
    console.error("Confirm import error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
