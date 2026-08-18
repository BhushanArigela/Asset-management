import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  return NextResponse.json({ data: await prisma.vendor.findMany({ include: { vendorTypeMappings: { include: { vendorType: true } } } }) });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { vendorTypeIds, ...rest } = body;
  const res = await prisma.vendor.create({ 
    data: {
      ...rest,
      vendorTypeMappings: {
        create: vendorTypeIds?.map((id: string) => ({ vendorTypeId: id }))
      }
    } 
  });
  return NextResponse.json(res, { status: 201 });
}
