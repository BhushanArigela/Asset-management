import { PrismaClient } from '@prisma/client';
import { ALL_PERMISSIONS } from '../src/lib/permissions';

const prisma = new PrismaClient();

async function main() {
  console.log('Adding new permissions to database...');
  for (const perm of ALL_PERMISSIONS) {
    await prisma.permission.upsert({
      where: {
        module_action: {
          module: perm.module,
          action: perm.action,
        },
      },
      update: {
        description: perm.description,
      },
      create: {
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
    });
  }
  
  // Also assign these new permissions to the admin role to prevent lockout
  const adminRole = await prisma.role.findFirst({
    where: { name: 'Administrator' } // or whatever the admin role is named
  });
  
  if (adminRole) {
    const allPerms = await prisma.permission.findMany();
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: adminRole.id,
            permissionId: perm.id
          }
        },
        update: {},
        create: {
          roleId: adminRole.id,
          permissionId: perm.id
        }
      });
    }
  }

  console.log('Permissions synchronized successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
