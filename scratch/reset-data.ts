import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting data reset (preserving users, roles, statuses, and conditions)...");

  // Delete transactional data
  console.log("Deleting Audit Logs...");
  await prisma.auditLog.deleteMany({});
  
  console.log("Deleting Asset Audits...");
  await prisma.auditResult.deleteMany({});
  await prisma.auditExpectedAsset.deleteMany({});
  await prisma.auditSession.deleteMany({});
  
  console.log("Deleting Maintenance Requests...");
  await prisma.maintenanceRequest.deleteMany({});
  
  console.log("Deleting Asset Movements...");
  await prisma.assetMovement.deleteMany({});
  
  console.log("Deleting Asset Documents...");
  await prisma.assetDocument.deleteMany({});
  
  console.log("Deleting Asset Warranties & AMCs...");
  await prisma.assetWarranty.deleteMany({});
  await prisma.assetAmc.deleteMany({});
  
  console.log("Deleting Import Logs...");
  await prisma.importLog.deleteMany({});

  // Delete core assets
  console.log("Deleting Assets...");
  await prisma.asset.deleteMany({});

  // Delete locations & hierarchy
  console.log("Deleting Rooms, Floors, Buildings, Companies...");
  await prisma.room.deleteMany({});
  await prisma.floor.deleteMany({});
  await prisma.building.deleteMany({});
  await prisma.company.deleteMany({});
  
  // Delete other masters
  console.log("Deleting Departments, Brands, Vendors, Categories...");
  await prisma.department.deleteMany({});
  await prisma.brand.deleteMany({});
  await prisma.vendorTypeMapping.deleteMany({});
  await prisma.vendor.deleteMany({});
  await prisma.assetSubCategory.deleteMany({});
  await prisma.assetCategory.deleteMany({});

  console.log("✅ Reset complete! All transactional and master data (except Users, Roles, Statuses, Conditions, VendorTypes) have been wiped.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
