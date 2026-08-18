import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { z } from "zod";

const createSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required"),
  code: z.string().min(1, "Code is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId");
    const where: any = {};
    if (categoryId) where.categoryId = categoryId;

    const items = await prisma.assetSubCategory.findMany({
      where, include: { category: true }, orderBy: { name: 'asc' }
    });
    return NextResponse.json({ data: items });
  } catch (error) {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const body = await req.json();
    const validatedData = createSchema.parse(body);

    const newItem = await prisma.assetSubCategory.create({ data: validatedData });
    await createAuditLog({ userId: session.user.id, action: AUDIT_ACTIONS.CREATE, module: AUDIT_MODULES.MASTER_DATA, details: `Created subcategory ${newItem.code}`, entityId: newItem.id });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
