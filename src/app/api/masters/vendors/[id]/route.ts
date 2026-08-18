import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return NextResponse.json(await prisma.vendor.findUnique({ where: { id: params.id }, include: { vendorTypeMappings: true } }));
}
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = await req.json();
  const { vendorTypeIds, ...rest } = body;
  
  // Basic sync logic placeholder
  await prisma.vendorTypeMapping.deleteMany({ where: { vendorId: params.id } });
  
  const res = await prisma.vendor.update({ 
    where: { id: params.id }, 
    data: {
      ...rest,
      vendorTypeMappings: {
        create: vendorTypeIds?.map((id: string) => ({ vendorTypeId: id }))
      }
    } 
  });
  return NextResponse.json(res);
}
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return NextResponse.json(await prisma.vendor.update({ where: { id: params.id }, data: { isActive: false } }));
}
