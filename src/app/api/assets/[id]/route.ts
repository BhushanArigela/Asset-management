import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createAuditLog, getChangedFields } from "@/lib/audit-logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";


const assetUpdateSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required").optional(),
  subCategoryId: z.string().optional(),
  brandId: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.number().optional(),
  vendorId: z.string().optional(),
  invoiceRef: z.string().optional(),
  commissioningDate: z.string().optional(),
  companyId: z.string().optional(),
  buildingId: z.string().optional(),
  floorId: z.string().optional(),
  roomId: z.string().optional(),
  departmentId: z.string().optional(),
  responsiblePerson: z.string().optional(),
  statusId: z.string().optional(),
  conditionId: z.string().optional(),
  warrantyApplicable: z.boolean().optional(),
  amcApplicable: z.boolean().optional(),
  notes: z.string().optional(),
  warranty: z.object({
    id: z.string().optional(),
    providerVendorId: z.string().optional(),
    startDate: z.string().optional(),
    expiryDate: z.string().optional(),
    reference: z.string().optional(),
    terms: z.string().optional(),
  }).optional().nullable(),
  amc: z.object({
    id: z.string().optional(),
    vendorId: z.string().optional(),
    startDate: z.string().optional(),
    expiryDate: z.string().optional(),
    contractRef: z.string().optional(),
    value: z.number().optional(),
    terms: z.string().optional(),
  }).optional().nullable(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_VIEW] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        subCategory: true,
        brand: true,
        company: true,
        building: true,
        floor: true,
        room: true,
        department: true,
        status: true,
        condition: true,
        vendor: true,
        assetDisposal: {
          include: {
            disposalDocuments: true,
            disposedBy: true
          }
        },
        assetDocuments: {
          include: { uploadedBy: { select: { name: true } } }
        },
        assetWarranties: {
          include: { providerVendor: true }
        },
        assetAmcs: {
          include: { vendor: true }
        },
        assetMovements: {
          include: {
            fromCompany: true,
            fromBuilding: true,
            fromFloor: true,
            fromRoom: true,
            fromDepartment: true,
            toCompany: true,
            toBuilding: true,
            toFloor: true,
            toRoom: true,
            toDepartment: true,
            transferredBy: true,
          },
          orderBy: { createdAt: "desc" },
        },
        assetStatusChanges: {
          include: { oldStatus: true, newStatus: true, changedBy: true },
          orderBy: { createdAt: "desc" },
        },
        assetConditionChanges: {
          include: { oldCondition: true, newCondition: true, changedBy: true },
          orderBy: { createdAt: "desc" },
        },
        maintenanceRequests: {
          include: {
            updates: {
              include: { createdBy: true },
              orderBy: { createdAt: 'desc' }
            }
          },
          orderBy: { createdAt: "desc" },
        },
        assetDisposal: true,
        accessories: true,
        createdBy: { select: { name: true, email: true } },
      },
    });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error fetching asset details:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await req.json();
    const validatedData = assetUpdateSchema.parse(body);
    const { warranty, amc, ...assetData } = validatedData;

    const existingAsset = await prisma.asset.findUnique({
      where: { id: params.id },
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    const updateData: any = {};
    for (const [key, value] of Object.entries(assetData)) {
      updateData[key] = value === "" ? null : value;
    }
    
    if (assetData.purchaseDate) {
      updateData.purchaseDate = new Date(assetData.purchaseDate);
    }
    
    if (assetData.commissioningDate) {
      updateData.commissioningDate = new Date(assetData.commissioningDate);
    }
    // We can clear old relations if we are updating them
    if (assetData.warrantyApplicable !== undefined) {
      await prisma.assetWarranty.deleteMany({ where: { assetId: params.id } });
      if (assetData.warrantyApplicable && warranty) {
        updateData.assetWarranties = {
          create: [{
            providerVendorId: warranty.providerVendorId,
            startDate: new Date(warranty.startDate),
            expiryDate: new Date(warranty.expiryDate),
            reference: warranty.reference,
            terms: warranty.terms,
          }]
        };
      }
    }
    
    if (assetData.amcApplicable !== undefined) {
      await prisma.assetAmc.deleteMany({ where: { assetId: params.id } });
      if (assetData.amcApplicable && amc) {
        updateData.assetAmcs = {
          create: [{
            vendorId: amc.vendorId,
            startDate: new Date(amc.startDate),
            expiryDate: new Date(amc.expiryDate),
            contractRef: amc.contractRef,
            value: amc.value,
            terms: amc.terms,
          }]
        };
      }
    }

    const updatedAsset = await prisma.asset.update({
      where: { id: params.id },
      data: updateData,
    });

    const changedFields = getChangedFields(existingAsset, updatedAsset);
    const changedKeys = Object.keys(changedFields.newValue);

    await createAuditLog({
      action: AUDIT_ACTIONS.UPDATE,
      module: AUDIT_MODULES.ASSETS,
      entityId: params.id,
      userId: session.user.id,
      details: `Asset updated. Changed fields: ${changedKeys.length > 0 ? changedKeys.join(", ") : "None"}`,
      oldData: changedFields.previousValue,
      newData: changedFields.newValue,
    });

    return NextResponse.json(updatedAsset);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation Error", details: error.errors },
        { status: 400 }
      );
    }
    console.error("Error updating asset:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_DELETE] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const assetId = params.id;

    const existingAsset = await prisma.asset.findUnique({
      where: { id: assetId },
      select: { assetCode: true, name: true }
    });

    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.assetMovement.deleteMany({ where: { assetId } }),
      prisma.auditResult.deleteMany({ where: { assetId } }),
      prisma.auditSessionItem.deleteMany({ where: { assetId } }),
      prisma.asset.delete({ where: { id: assetId } })
    ]);

    await createAuditLog({
      action: AUDIT_ACTIONS.DELETE,
      module: AUDIT_MODULES.ASSETS,
      entityId: assetId,
      userId: session.user.id,
      details: `Asset permanently deleted (${existingAsset.assetCode} - ${existingAsset.name})`,
    });

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error in asset deletion:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
