const ExcelJS = require('exceljs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile('asset-import-template.xlsx');
  const worksheet = workbook.worksheets[0];

  const headers = {};
  worksheet.getRow(1).eachCell((cell, colNumber) => {
    headers[cell.value?.toString().trim()] = colNumber;
  });

  const getCol = (name) => headers[name] || -1;
  const colIdx = {
    assetCode: getCol("Asset Code*") !== -1 ? getCol("Asset Code*") : getCol("Asset Code"),
    name: getCol("Name*") !== -1 ? getCol("Name*") : getCol("Name"),
    category: getCol("Category Name*") !== -1 ? getCol("Category Name*") : getCol("Category Name"),
    company: getCol("Company Code*") !== -1 ? getCol("Company Code*") : getCol("Company Code"),
    status: getCol("Status Name*") !== -1 ? getCol("Status Name*") : getCol("Status Name"),
    condition: getCol("Condition Name*") !== -1 ? getCol("Condition Name*") : getCol("Condition Name"),
    building: getCol("Building Code"),
    department: getCol("Department Code"),
    vendor: getCol("Vendor Code"),
    model: getCol("Model"),
    serialNumber: getCol("Serial Number"),
    purchaseDate: getCol("Purchase Date (YYYY-MM-DD)"),
    purchaseCost: getCol("Purchase Cost"),
    invoiceRef: getCol("Invoice Ref"),
    warrantyProvider: getCol("Warranty Provider Code"),
    warrantyStart: getCol("Warranty Start (YYYY-MM-DD)"),
    warrantyExpiry: getCol("Warranty Expiry (YYYY-MM-DD)"),
    warrantyRef: getCol("Warranty Ref"),
    amcVendor: getCol("AMC Vendor Code"),
    amcStart: getCol("AMC Start (YYYY-MM-DD)"),
    amcExpiry: getCol("AMC Expiry (YYYY-MM-DD)"),
    amcRef: getCol("AMC Ref"),
    amcValue: getCol("AMC Value"),
  };

  const getVal = (row, col) => {
    if (col === -1) return "";
    const cell = row.getCell(col);
    return cell ? cell.text?.toString().trim() : "";
  };

  const row = worksheet.getRow(19); // AST-018
  const assetCode = getVal(row, colIdx.assetCode);
  
  console.log("Processing:", assetCode);

  try {
    const adminUser = await prisma.user.findFirst({ where: { email: 'admin@sheraton.com' } });

    // Mock resolved ids
    let cat = await prisma.assetCategory.findFirst({ where: { name: getVal(row, colIdx.category) }});
    if (!cat) cat = await prisma.assetCategory.create({ data: { name: getVal(row, colIdx.category), code: getVal(row, colIdx.category) }});
    
    let comp = await prisma.company.findFirst({ where: { code: getVal(row, colIdx.company) }});
    if (!comp) comp = await prisma.company.create({ data: { name: getVal(row, colIdx.company), code: getVal(row, colIdx.company) }});

    let stat = await prisma.assetStatus.findFirst({ where: { name: getVal(row, colIdx.status) }});
    if (!stat) stat = await prisma.assetStatus.create({ data: { name: getVal(row, colIdx.status) }});

    let cond = await prisma.assetCondition.findFirst({ where: { name: getVal(row, colIdx.condition) }});
    if (!cond) cond = await prisma.assetCondition.create({ data: { name: getVal(row, colIdx.condition) }});

    const assetData = {
      assetCode,
      name: getVal(row, colIdx.name),
      categoryId: cat.id,
      companyId: comp.id,
      statusId: stat.id,
      conditionId: cond.id,
      createdById: adminUser.id
    };

    console.log("Inserting:", assetData);

    const newAsset = await prisma.asset.create({
      data: assetData
    });

    console.log("Success!", newAsset.id);
  } catch (err) {
    console.error("Prisma Error:", err);
  }
}

main().finally(() => prisma.$disconnect());
