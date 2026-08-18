import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// All permission definitions
const ALL_PERMISSIONS = [
  { module: "users", action: "view", description: "View users" },
  { module: "users", action: "create", description: "Create users" },
  { module: "users", action: "edit", description: "Edit users" },
  { module: "users", action: "delete", description: "Delete / deactivate users" },
  { module: "roles", action: "view", description: "View roles" },
  { module: "roles", action: "create", description: "Create roles" },
  { module: "roles", action: "edit", description: "Edit roles and permissions" },
  { module: "roles", action: "delete", description: "Delete / deactivate roles" },
  { module: "masters", action: "view", description: "View master data" },
  { module: "masters", action: "create", description: "Create master records" },
  { module: "masters", action: "edit", description: "Edit master records" },
  { module: "masters", action: "delete", description: "Delete / deactivate master records" },
  { module: "assets", action: "view", description: "View assets" },
  { module: "assets", action: "create", description: "Register new assets" },
  { module: "assets", action: "edit", description: "Edit asset information" },
  { module: "assets", action: "delete", description: "Delete assets" },
  { module: "assets", action: "import", description: "Import assets from Excel" },
  { module: "assets", action: "export", description: "Export assets to Excel" },
  { module: "maintenance", action: "view", description: "View maintenance requests" },
  { module: "maintenance", action: "create", description: "Create maintenance requests" },
  { module: "maintenance", action: "edit", description: "Update maintenance requests" },
  { module: "movements", action: "view", description: "View asset movements" },
  { module: "movements", action: "create", description: "Create asset transfers" },
  { module: "warranty", action: "view", description: "View warranty information" },
  { module: "warranty", action: "edit", description: "Manage warranty records" },
  { module: "amc", action: "view", description: "View AMC information" },
  { module: "amc", action: "edit", description: "Manage AMC records" },
  { module: "reports", action: "view", description: "View reports" },
  { module: "reports", action: "export", description: "Export reports" },
  { module: "audits", action: "view", description: "View audit sessions" },
  { module: "audits", action: "create", description: "Create audit sessions" },
  { module: "audits", action: "execute", description: "Execute physical audits" },
  { module: "audits", action: "complete", description: "Complete and lock audits" },
  { module: "audit_logs", action: "view", description: "View system audit logs" },
  { module: "audit_logs", action: "export", description: "Export audit logs" },
];

const VENDOR_TYPES = [
  { name: "Supplier", description: "Product/equipment supplier" },
  { name: "Maintenance", description: "Maintenance and repair service provider" },
  { name: "Warranty Provider", description: "Warranty service provider" },
  { name: "AMC Provider", description: "Annual Maintenance Contract provider" },
];

async function main() {
  console.log("🌱 Starting database seed...\n");

  // 1. Create permissions
  console.log("📋 Creating permissions...");
  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: { module_action: { module: perm.module, action: perm.action } },
      update: { description: perm.description },
      create: perm,
    });
  }

  // 2. Create Admin role
  const adminRole = await prisma.role.upsert({
    where: { name: "Administrator" },
    update: {},
    create: { name: "Administrator", description: "Full system access", isActive: true },
  });

  // 3. Assign permissions
  const allPermissions = await prisma.permission.findMany();
  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: permission.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: permission.id },
    });
  }

  // 4. Create default admin user
  const passwordHash = await bcrypt.hash("admin123", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@sheraton.com" },
    update: {},
    create: {
      name: "System Administrator",
      email: "admin@sheraton.com",
      passwordHash: passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
  });

  // 5. Vendor Types
  for (const vt of VENDOR_TYPES) {
    await prisma.vendorType.upsert({
      where: { name: vt.name },
      update: { description: vt.description },
      create: vt,
    });
  }

  // 6. Statuses
  const statuses = [
    { name: "Active", colorCode: "#22C55E", description: "Asset is in active use", sortOrder: 1 },
    { name: "In Storage", colorCode: "#3B82F6", description: "Asset is stored/not in use", sortOrder: 2 },
    { name: "Under Maintenance", colorCode: "#F59E0B", description: "Asset is being serviced", sortOrder: 3 },
    { name: "Damaged", colorCode: "#EF4444", description: "Asset is damaged", sortOrder: 4 },
    { name: "Missing", colorCode: "#8B5CF6", description: "Asset cannot be located", sortOrder: 5 },
    { name: "Disposed", colorCode: "#6B7280", description: "Asset has been disposed", sortOrder: 6 },
  ];
  for (const status of statuses) {
    await prisma.assetStatus.upsert({
      where: { name: status.name },
      update: { colorCode: status.colorCode, sortOrder: status.sortOrder },
      create: status,
    });
  }

  // 7. Conditions
  const conditions = [
    { name: "New", colorCode: "#22C55E", sortOrder: 1 },
    { name: "Excellent", colorCode: "#10B981", sortOrder: 2 },
    { name: "Good", colorCode: "#3B82F6", sortOrder: 3 },
    { name: "Fair", colorCode: "#F59E0B", sortOrder: 4 },
    { name: "Poor", colorCode: "#EF4444", sortOrder: 5 },
    { name: "Non-Functional", colorCode: "#991B1B", sortOrder: 6 },
  ];
  for (const condition of conditions) {
    await prisma.assetCondition.upsert({
      where: { name: condition.name },
      update: { colorCode: condition.colorCode, sortOrder: condition.sortOrder },
      create: condition,
    });
  }

  console.log("🏢 Creating demo hierarchy (Company, Building, Department, Category)...");

  // Create Company
  const company = await prisma.company.upsert({
    where: { code: "SHR-01" },
    update: {},
    create: { name: "Sheraton Grand", code: "SHR-01" },
  });

  // Create Building & Floor
  const building = await prisma.building.upsert({
    where: { companyId_code: { companyId: company.id, code: "MAIN-BLD" } },
    update: {},
    create: { name: "Main Tower", code: "MAIN-BLD", companyId: company.id },
  });
  const floor = await prisma.floor.upsert({
    where: { buildingId_code: { buildingId: building.id, code: "FL-1" } },
    update: {},
    create: { name: "1st Floor", code: "FL-1", buildingId: building.id },
  });

  // Create Department
  const department = await prisma.department.upsert({
    where: { code: "IT-01" },
    update: {},
    create: { name: "Information Technology", code: "IT-01" },
  });

  // Create Category
  const category = await prisma.assetCategory.upsert({
    where: { code: "IT-HW" },
    update: {},
    create: { name: "IT Hardware", code: "IT-HW" },
  });

  // Get random statuses and conditions
  const allStatuses = await prisma.assetStatus.findMany();
  const activeStatus = allStatuses.find(s => s.name === "Active")!;
  const disposedStatus = allStatuses.find(s => s.name === "Disposed")!;
  const damagedStatus = allStatuses.find(s => s.name === "Damaged")!;
  
  const allConditions = await prisma.assetCondition.findMany();
  const goodCondition = allConditions.find(s => s.name === "Good")!;
  const poorCondition = allConditions.find(s => s.name === "Poor")!;

  console.log("💻 Creating demo assets...");

  // Asset 1 - Active
  await prisma.asset.upsert({
    where: { assetCode: "AST-DEMO-001" },
    update: {},
    create: {
      assetCode: "AST-DEMO-001",
      name: "Dell XPS 15",
      description: "Developer Laptop",
      categoryId: category.id,
      companyId: company.id,
      buildingId: building.id,
      floorId: floor.id,
      departmentId: department.id,
      statusId: activeStatus.id,
      conditionId: goodCondition.id,
      createdById: adminUser.id,
      purchaseCost: 1500.00,
    }
  });

  // Asset 2 - Damaged
  await prisma.asset.upsert({
    where: { assetCode: "AST-DEMO-002" },
    update: {},
    create: {
      assetCode: "AST-DEMO-002",
      name: "Cisco Switch 24-Port",
      description: "Network Switch",
      categoryId: category.id,
      companyId: company.id,
      buildingId: building.id,
      floorId: floor.id,
      departmentId: department.id,
      statusId: damagedStatus.id,
      conditionId: poorCondition.id,
      createdById: adminUser.id,
      purchaseCost: 800.00,
    }
  });

  // Asset 3 - Disposed
  const disposedAsset = await prisma.asset.upsert({
    where: { assetCode: "AST-DEMO-003" },
    update: {},
    create: {
      assetCode: "AST-DEMO-003",
      name: "Old Printer HP",
      description: "LaserJet",
      categoryId: category.id,
      companyId: company.id,
      buildingId: building.id,
      floorId: floor.id,
      departmentId: department.id,
      statusId: disposedStatus.id,
      conditionId: poorCondition.id,
      createdById: adminUser.id,
      purchaseCost: 300.00,
      isDisposed: true,
    }
  });

  // Create Disposal Record for Asset 3
  await prisma.assetDisposal.create({
    data: {
      assetId: disposedAsset.id,
      disposedById: adminUser.id,
      disposalDate: new Date(),
      reason: "E-Waste / Beyond repair",
      method: "Recycled",
      value: 0,
    }
  });

  console.log("\n✅ Database seeded successfully with demo data!");
  console.log("\n📌 Default Login Credentials:");
  console.log("   Email:    admin@sheraton.com");
  console.log("   Password: admin123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
