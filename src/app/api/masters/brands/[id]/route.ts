import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return NextResponse.json(await prisma.brand.findUnique({ where: { id: params.id } }));
}
export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const body = await req.json();
  return NextResponse.json(await prisma.brand.update({ where: { id: params.id }, data: body }));
}
export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return NextResponse.json(await prisma.brand.update({ where: { id: params.id }, data: { isActive: false } }));
}
