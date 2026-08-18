const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const search = "";
  const where = {
    isDisposed: false,
  };
  
  if (search) {
      where.OR = [
        { assetCode: { contains: search } },
        { name: { contains: search } },
        { serialNumber: { contains: search } },
        { model: { contains: search } },
      ];
  }
  
  const assets = await prisma.asset.findMany({ where });
  console.log("Total matched for empty string:", assets.length);
}

main().catch(console.error).finally(() => prisma.$disconnect());
