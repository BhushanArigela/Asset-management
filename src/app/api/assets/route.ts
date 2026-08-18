import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import QRCode from "qrcode";
import { format } from "date-fns";

const assetSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().optional(),
  brandId: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.number().optional(),
  vendorId: z.string().optional(),
  invoiceRef: z.string().optional(),
  commissioningDate: z.string().optional(),
  companyId: z.string().min(1, "Company is required"),
  buildingId: z.string().min(1, "Building is required"),
  floorId: z.string().min(1, "Floor is required"),
  roomId: z.string().optional(),
  departmentId: z.string().optional(),
  responsiblePerson: z.string().optional(),
  statusId: z.string().min(1, "Status is required"),
  conditionId: z.string().min(1, "Condition is required"),
  warrantyApplicable: z.boolean().default(false),
  amcApplicable: z.boolean().default(false),
  notes: z.string().optional(),
  warranty: z.object({
    providerVendorId: z.string().optional(),
    startDate: z.string().optional(),
    expiryDate: z.string().optional(),
    reference: z.string().optional(),
    terms: z.string().optional(),
  }).optional().nullable(),
  amc: z.object({
    vendorId: z.string().optional(),
    startDate: z.string().optional(),
    expiryDate: z.string().optional(),
    contractRef: z.string().optional(),
    value: z.number().optional(),
    terms: z.string().optional(),
  }).optional().nullable(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_VIEW] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    
    const categoryId = searchParams.get("categoryId");
    const subCategoryId = searchParams.get("subCategoryId");
    const companyId = searchParams.get("companyId");
    const buildingId = searchParams.get("buildingId");
    const floorId = searchParams.get("floorId");
    const roomId = searchParams.get("roomId");
    const departmentId = searchParams.get("departmentId");
    const statusId = searchParams.get("statusId");
    const conditionId = searchParams.get("conditionId");
    const vendorId = searchParams.get("vendorId");
    const warrantyApplicable = searchParams.get("warrantyApplicable");
    const amcApplicable = searchParams.get("amcApplicable");
    const isDisposed = searchParams.get("isDisposed");

    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    const where: any = {
      isDisposed: isDisposed === "true" ? true : false,
    };

    if (search) {
      where.OR = [
        { assetCode: { contains: search } },
        { name: { contains: search } },
        { serialNumber: { contains: search } },
        { model: { contains: search } },
        { room: { code: { contains: search } } },
        { room: { name: { contains: search } } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (subCategoryId) where.subCategoryId = subCategoryId;
    if (companyId) where.companyId = companyId;
    if (buildingId) where.buildingId = buildingId;
    if (floorId) where.floorId = floorId;
    if (roomId) where.roomId = roomId;
    if (departmentId) where.departmentId = departmentId;
    if (statusId) where.statusId = statusId;
    if (conditionId) where.conditionId = conditionId;
    if (vendorId) where.vendorId = vendorId;
    if (warrantyApplicable !== null) where.warrantyApplicable = warrantyApplicable === "true";
    if (amcApplicable !== null) where.amcApplicable = amcApplicable === "true";

    const skip = (page - 1) * limit;

    const [assets, totalCount] = await Promise.all([
      prisma.asset.findMany({
        where,
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
          assetDocuments: {
            where: { documentType: 'Asset photographs' },
            take: 1,
            orderBy: { createdAt: 'desc' }
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      prisma.asset.count({ where }),
    ]);

    return NextResponse.json({
      data: assets,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_CREATE] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = assetSchema.parse(body);
    const { warranty, amc, ...assetData } = validatedData;

    const today = new Date();
    const datePrefix = format(today, "yyyyMMdd");
    
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayCount = await prisma.asset.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    const sequence = String(todayCount + 1).padStart(4, "0");
    const assetCode = `SH-AST-${datePrefix}-${sequence}`;

    const assetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/assets/${assetCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(assetUrl);

    const insertData: any = {};
    for (const [key, value] of Object.entries(assetData)) {
      insertData[key] = value === "" ? null : value;
    }

    const newAsset = await prisma.asset.create({
      data: {
        ...insertData,
        assetCode,
        qrCode: qrCodeDataUrl,
        purchaseDate: assetData.purchaseDate ? new Date(assetData.purchaseDate) : null,
        commissioningDate: assetData.commissioningDate ? new Date(assetData.commissioningDate) : null,
        createdById: session.user.id,
        ...(assetData.warrantyApplicable && warranty ? {
          assetWarranties: {
            create: [{
              providerVendorId: warranty.providerVendorId,
              startDate: new Date(warranty.startDate),
              expiryDate: new Date(warranty.expiryDate),
              reference: warranty.reference,
              terms: warranty.terms,
            }]
          }
        } : {}),
        ...(assetData.amcApplicable && amc ? {
          assetAmcs: {
            create: [{
              vendorId: amc.vendorId,
              startDate: new Date(amc.startDate),
              expiryDate: new Date(amc.expiryDate),
              contractRef: amc.contractRef,
              value: amc.value,
              terms: amc.terms,
            }]
          }
        } : {}),
      },
    });

    await createAuditLog({
      action: AUDIT_ACTIONS.CREATE,
      module: AUDIT_MODULES.ASSETS,
      entityId: newAsset.id,
      userId: session.user.id,
      details: "Asset registered manually",
      newData: newAsset,
    });

    return NextResponse.json(newAsset, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation Error", details: error.issues }, { status: 400 });
    }
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
