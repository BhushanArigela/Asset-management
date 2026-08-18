import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

const updateRoleSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  permissionIds: z.array(z.string()).optional(),
});

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = hasPermission(session.user.permissions, [PERMISSIONS.ROLES_VIEW] as any);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        rolePermissions: {
          include: {
            permission: true
          }
        }
      }
    });

    if (!role) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = hasPermission(session.user.permissions, [PERMISSIONS.ROLES_EDIT] as any);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateRoleSchema.parse(body);

    const currentRole = await prisma.role.findUnique({
      where: { id: params.id }
    });

    if (!currentRole) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }

    // Update role details and sync permissions
    const updatedRole = await prisma.$transaction(async (tx) => {
      // If permissionIds provided, sync them
      if (validatedData.permissionIds) {
        // Delete old permissions
        await tx.rolePermission.deleteMany({
          where: { roleId: params.id }
        });

        // Add new permissions
        if (validatedData.permissionIds.length > 0) {
          await tx.rolePermission.createMany({
            data: validatedData.permissionIds?.map(permissionId => ({
              roleId: params.id,
              permissionId
            }))
          });
        }
      }

      // Update role basic info
      const { permissionIds, ...roleData } = validatedData;
      return tx.role.update({
        where: { id: params.id },
        data: roleData
      });
    });

    await createAuditLog({
      userId: session.user.id,
      action: AUDIT_ACTIONS.UPDATE,
      module: AUDIT_MODULES.ROLES,
      details: `Updated role ${updatedRole.name}`,
      entityId: updatedRole.id,
    });

    return NextResponse.json(updatedRole);
  } catch (error) {
    console.error("Error updating role:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Validation error", details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const authorized = hasPermission(session.user.permissions, [PERMISSIONS.ROLES_DELETE] as any);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check if users are assigned
    const usersCount = await prisma.user.count({
      where: { roleId: params.id, isActive: true }
    });

    if (usersCount > 0) {
      return NextResponse.json({ error: "Cannot delete role with active users assigned" }, { status: 400 });
    }

    const deletedRole = await prisma.role.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    await createAuditLog({
      userId: session.user.id,
      action: AUDIT_ACTIONS.DELETE,
      module: AUDIT_MODULES.ROLES,
      details: `Soft deleted role ${deletedRole.name}`,
      entityId: deletedRole.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
