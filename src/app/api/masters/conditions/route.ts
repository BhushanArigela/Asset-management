import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  return NextResponse.json({ data: await prisma.assetCondition.findMany() });
}
export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await prisma.assetCondition.create({ data: body });
  return NextResponse.json(res, { status: 201 });
}
