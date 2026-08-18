"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Printer, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface QrModalProps {
  assetId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function QrCodeModal({ assetId, isOpen, onClose }: QrModalProps) {
  const [loading, setLoading] = useState(false);
  const [qrData, setQrData] = useState<{ qrCodeDataUrl: string; assetCode: string } | null>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (isOpen && assetId) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/qr/${assetId}?json=true`)
        .then((res) => {
          if (!res.ok) throw new Error("Failed to load QR code");
          return res.json();
        })
        .then((data) => setQrData(data))
        .catch((err) => toast.error(err.message))
        .finally(() => setLoading(false));
    } else {
      setQrData(null);
    }
  }, [assetId, isOpen]);

  const handlePrint = () => {
    if (!qrData) return;
    const iframe = printIframeRef.current;
    if (!iframe) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Print QR - ${qrData.assetCode}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;">
          <img src="${qrData.qrCodeDataUrl}" style="width:300px;height:300px;margin-bottom:20px;" />
          <h1 style="margin:0;font-size:24px;">${qrData.assetCode}</h1>
        </body>
      </html>
    `;

    const doc = iframe.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();

      setTimeout(() => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      }, 250);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-6">
        <DialogHeader>
          <DialogTitle className="text-center">Asset QR Code</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Loading QR Code...</p>
          </div>
        ) : qrData ? (
          <div className="flex flex-col items-center justify-center space-y-4 my-4">
            <img src={qrData.qrCodeDataUrl} alt={qrData.assetCode} className="w-64 h-64 border rounded-md" />
            <h2 className="text-2xl font-bold tracking-tight">{qrData.assetCode}</h2>
          </div>
        ) : null}

        <Button onClick={handlePrint} disabled={!qrData || loading} className="w-full mt-4">
          <Printer className="mr-2 h-4 w-4" /> Print
        </Button>
        <iframe ref={printIframeRef} style={{ display: "none" }} title="Print Frame" />
      </DialogContent>
    </Dialog>
  );
}
