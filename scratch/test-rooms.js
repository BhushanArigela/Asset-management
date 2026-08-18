const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const rooms = await prisma.room.findMany({
    include: { floor: { include: { building: true } } },
  });
  console.log("Found rooms:", rooms.length);
  if (rooms.length > 0) {
    console.log(rooms[0]);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
