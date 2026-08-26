import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import nodemailer from "nodemailer";

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
    const { host, port, secure, user, password } = data;

    if (!host || !port || !user) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    let finalPassword = password;
    if (!finalPassword) {
      const existing = await prisma.smtpConfig.findFirst();
      if (existing) {
        finalPassword = existing.password;
      }
    }

    if (!finalPassword) {
        return NextResponse.json({ error: "Password is required for testing connection." }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port),
      secure: Boolean(secure),
      auth: {
        user,
        pass: finalPassword,
      },
      connectionTimeout: 10000,
    });

    await transporter.verify();

    return NextResponse.json({ success: true, message: "Connection successful" });
  } catch (error: any) {
    console.error("SMTP Test Error:", error);
    return NextResponse.json(
      { error: "Failed to connect: " + (error.message || "Unknown error") },
      { status: 500 }
    );
  }
}
