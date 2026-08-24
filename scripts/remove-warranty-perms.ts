import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Removing Warranty permissions from database...');
  const result = await prisma.permission.deleteMany({
    where: {
      module: 'warranty',
    },
  });
  console.log(`Deleted ${result.count} Warranty permissions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
