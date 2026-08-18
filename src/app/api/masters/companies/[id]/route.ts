import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { z } from "zod";

const updateCompanySchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  code: z.string().min(1, "Code is required").optional(),
  address: z.string().optional(),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  isActive: z.boolean().optional(),
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

    const authorized = hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_VIEW] as any);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const company = await prisma.company.findUnique({
      where: { id: params.id }
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
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

    const authorized = hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_EDIT] as any);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const validatedData = updateCompanySchema.parse(body);

    const currentCompany = await prisma.company.findUnique({
      where: { id: params.id }
    });

    if (!currentCompany) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    if (validatedData.code && validatedData.code !== currentCompany.code) {
      const existingCompany = await prisma.company.findFirst({
        where: { code: validatedData.code }
      });
      if (existingCompany) {
        return NextResponse.json({ error: "Company code already exists" }, { status: 400 });
      }
    }

    const updatedCompany = await prisma.company.update({
      where: { id: params.id },
      data: validatedData
    });

    await createAuditLog({
      userId: session.user.id,
      action: AUDIT_ACTIONS.UPDATE,
      module: AUDIT_MODULES.MASTER_DATA,
      details: `Updated company ${updatedCompany.name} (${updatedCompany.code})`,
      entityId: updatedCompany.id,
    });

    return NextResponse.json(updatedCompany);
  } catch (error) {
    console.error("Error updating company:", error);
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

    const authorized = hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_DELETE] as any);
    if (!authorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Check relations if needed (e.g. if company has buildings)
    const buildingsCount = await prisma.building.count({
      where: { companyId: params.id, isActive: true }
    });

    if (buildingsCount > 0) {
      return NextResponse.json({ error: "Cannot delete company with active buildings" }, { status: 400 });
    }

    const deletedCompany = await prisma.company.update({
      where: { id: params.id },
      data: { isActive: false }
    });

    await createAuditLog({
      userId: session.user.id,
      action: AUDIT_ACTIONS.DELETE,
      module: AUDIT_MODULES.MASTER_DATA,
      details: `Soft deleted company ${deletedCompany.name}`,
      entityId: deletedCompany.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
