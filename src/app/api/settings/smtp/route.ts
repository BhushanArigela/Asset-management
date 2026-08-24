import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions, [PERMISSIONS.SETTINGS_VIEW] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const config = await prisma.smtpConfig.findFirst();

    if (!config) {
      return NextResponse.json(null);
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching SMTP config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(session.user.permissions, [PERMISSIONS.SETTINGS_EDIT] as any)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await request.json();
    const { host, port, secure, user, password, fromEmail, fromName } = data;

    if (!host || !port || !user || !fromEmail) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const existing = await prisma.smtpConfig.findFirst();

    let config;
    if (existing) {
      config = await prisma.smtpConfig.update({
        where: { id: existing.id },
        data: {
          host,
          port: parseInt(port),
          secure: Boolean(secure),
          user,
          password: password || existing.password,
          fromEmail,
          fromName: fromName || "",
        },
      });
    } else {
      config = await prisma.smtpConfig.create({
        data: {
          host,
          port: parseInt(port),
          secure: Boolean(secure),
          user,
          password,
          fromEmail,
          fromName: fromName || "",
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error saving SMTP config:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
