const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const assetId = "cmsui848p0001srqgrwmy1tb1";
  
  const existingAsset = await prisma.asset.findUnique({
    where: { id: assetId },
  });

  if (!existingAsset) {
    console.log("Asset not found");
    return;
  }
  
  console.log("Found asset:", existingAsset.name);

  // Simulate update
  try {
    const updatedAsset = await prisma.asset.update({
      where: { id: assetId },
      data: {
        name: existingAsset.name + " updated",
      },
    });
    console.log("Update successful", updatedAsset.id);
  } catch(e) {
    console.error("Update failed:", e);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
