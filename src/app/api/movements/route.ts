import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.VIEW_ASSET] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50");

    const movements = await prisma.assetMovement.findMany({
      include: {
        asset: { select: { assetCode: true, name: true } },
        fromBuilding: { select: { name: true } },
        toBuilding: { select: { name: true } },
        transferredBy: { select: { name: true } },
      },
      orderBy: { transferDate: "desc" },
      take: limit,
    });

    return NextResponse.json(movements);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
