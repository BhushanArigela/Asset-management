import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const [
      totalAssets,
      assetsUnderMaintenance,
      damagedAssets,
      missingAssets,
      warrantiesExpiring,
      amcsExpiring,
      recentAssets,
      statusCounts,
      conditionCounts,
      categoryCounts,
      buildingCounts,
      departmentCounts,
      totalValueRaw,
      totalLocations,
      totalVendors,
      activeUsers,
      pendingAudits,
      totalAuditLogs,
      overdueTasks
    ] = await Promise.all([
      prisma.asset.count({ where: { isDisposed: false } }),
      prisma.asset.count({ where: { status: { name: "Under Maintenance" }, isDisposed: false } }),
      prisma.asset.count({ where: { condition: { name: "Damaged" }, isDisposed: false } }),
      prisma.asset.count({ where: { status: { name: "Missing" }, isDisposed: false } }),
      prisma.asset.count({
        where: {
          isDisposed: false,
          assetWarranties: {
            some: {
              expiryDate: {
                gte: new Date(),
                lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
              },
              isActive: true,
            }
          }
        },
      }),
      prisma.asset.count({
        where: {
          isDisposed: false,
          assetAmcs: {
            some: {
              expiryDate: {
                gte: new Date(),
                lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
              },
              isActive: true,
            }
          }
        },
      }),
      prisma.asset.findMany({
        where: { isDisposed: false },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { category: true, department: true },
      }),
      prisma.asset.groupBy({
        where: { isDisposed: false },
        by: ["statusId"],
        _count: { statusId: true },
      }),
      prisma.asset.groupBy({
        where: { isDisposed: false },
        by: ["conditionId"],
        _count: { conditionId: true },
      }),
      prisma.asset.groupBy({
        where: { isDisposed: false },
        by: ["categoryId"],
        _count: { categoryId: true },
        orderBy: { _count: { categoryId: 'desc' } },
        take: 10,
      }),
      prisma.asset.groupBy({
        where: { isDisposed: false },
        by: ["buildingId"],
        _count: { buildingId: true },
        orderBy: { _count: { buildingId: 'desc' } },
        take: 10,
      }),
      prisma.asset.groupBy({
        where: { isDisposed: false },
        by: ["departmentId"],
        _count: { departmentId: true },
        orderBy: { _count: { departmentId: 'desc' } },
        take: 10,
      }),
      prisma.asset.aggregate({
        where: { isDisposed: false },
        _sum: { purchaseCost: true },
      }),
      // Quick Overview Stats
      prisma.building.count(),
      prisma.vendor.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.auditSession.count({ where: { status: { in: ["PLANNED", "IN_PROGRESS"] } } }),
      prisma.auditLog.count(),
      prisma.maintenanceRequest.count({ where: { status: { in: ["OPEN", "IN_PROGRESS"] }, maintenanceDate: { lt: new Date() } } })
    ]);

    // Format the group by results with names
    const statusIds = statusCounts?.map(s => s.statusId).filter(Boolean) as string[];
    const statuses = await prisma.assetStatus.findMany({ where: { id: { in: statusIds } } });

    const conditionIds = conditionCounts?.map(c => c.conditionId).filter(Boolean) as string[];
    const conditions = await prisma.assetCondition.findMany({ where: { id: { in: conditionIds } } });

    const categoryIds = categoryCounts?.map(c => c.categoryId).filter(Boolean) as string[];
    const categories = await prisma.assetCategory.findMany({ where: { id: { in: categoryIds } } });
    
    const buildingIds = buildingCounts?.map(b => b.buildingId).filter(Boolean) as string[];
    const buildings = await prisma.building.findMany({ where: { id: { in: buildingIds } } });

    const departmentIds = departmentCounts?.map(d => d.departmentId).filter(Boolean) as string[];
    const departments = await prisma.department.findMany({ where: { id: { in: departmentIds } } });

    const formattedCategoryCounts = categoryCounts?.map(c => ({
      name: categories.find(cat => cat.id === c.categoryId)?.name || 'Unknown',
      value: c._count.categoryId
    }));

    const formattedBuildingCounts = buildingCounts?.map(b => ({
      name: buildings.find(bld => bld.id === b.buildingId)?.name || 'Unknown',
      value: b._count.buildingId
    }));

    const formattedDepartmentCounts = departmentCounts?.map(d => ({
      name: departments.find(dep => dep.id === d.departmentId)?.name || 'Unknown',
      value: d._count.departmentId
    }));

    const data = {
      totalAssets,
      totalAssetValue: totalValueRaw._sum.purchaseCost || 0,
      assetsUnderMaintenance,
      damagedAssets,
      missingAssets,
      warrantiesExpiring,
      amcsExpiring,
      recentAssets,
      assetsByStatus: statusCounts?.map(s => ({ 
        name: statuses.find(st => st.id === s.statusId)?.name || 'Unknown', 
        value: s._count.statusId 
      })),
      assetsByCondition: conditionCounts?.map(c => ({ 
        name: conditions.find(cd => cd.id === c.conditionId)?.name || 'Unknown', 
        value: c._count.conditionId 
      })),
      assetsByCategory: formattedCategoryCounts,
      assetsByBuilding: formattedBuildingCounts,
      assetsByDepartment: formattedDepartmentCounts,
      // Overview stats
      totalLocations,
      totalVendors,
      activeUsers,
      pendingAudits,
      totalAuditLogs,
      overdueTasks,
    };

    return NextResponse.json(data);
  } catch (error) {
    console.error("[DASHBOARD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
