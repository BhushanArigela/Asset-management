import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Removing AMC permissions from database...');
  const result = await prisma.permission.deleteMany({
    where: {
      module: 'amc',
    },
  });
  console.log(`Deleted ${result.count} AMC permissions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
