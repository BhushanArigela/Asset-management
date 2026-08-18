const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assets = await prisma.asset.count();
  const rooms = await prisma.room.count();
  console.log(`Found assets: ${assets}, rooms: ${rooms}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
