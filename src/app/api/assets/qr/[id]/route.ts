import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";


export async function GET(
  req: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!hasPermission(session.user.permissions, [PERMISSIONS.ASSETS_VIEW] as any)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const asset = await prisma.asset.findUnique({
      where: { id: params.id },
      select: { assetCode: true, qrCode: true }
    });

    if (!asset) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const qrCodeDataUrl = asset.qrCode || (await QRCode.toDataURL(`${process.env.NEXT_PUBLIC_APP_URL}/assets/${asset.assetCode}`));
    
    const { searchParams } = new URL(req.url);
    if (searchParams.get("json") === "true") {
      return NextResponse.json({ qrCodeDataUrl, assetCode: asset.assetCode });
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>QR - ${asset.assetCode}</title></head>
        <body style="display:flex;justify-content:center;align-items:center;height:100vh;margin:0;">
          <div style="text-align:center;">
            <img src="${qrCodeDataUrl}" alt="QR Code" style="width:300px;height:300px;" />
            <h2>${asset.assetCode}</h2>
            <button onclick="window.print()" style="padding:10px 20px;margin-top:20px;cursor:pointer;">Print</button>
          </div>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: { "Content-Type": "text/html" },
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
