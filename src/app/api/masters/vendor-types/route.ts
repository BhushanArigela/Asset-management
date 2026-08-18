import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  return NextResponse.json({ data: await prisma.vendorType.findMany() });
}
