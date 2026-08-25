"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Printer, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import QRCode from "qrcode";

export function RoomAssetsModal({ room, open, onOpenChange }: { room: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const printIframeRef = useRef<HTMLIFrameElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (open && room?.id) {
      setLoading(true);
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets?roomId=${room.id}&limit=1000`)
        .then(res => res.json())
        .then(data => setAssets(data.data || []))
        .catch(() => toast.error("Failed to load assets"))
        .finally(() => setLoading(false));
    } else {
      setAssets([]);
    }
  }, [open, room]);

  const handleBulkPrint = async () => {
    if (assets.length === 0) {
      toast.error("No assets found in this room to print");
      return;
    }

    setIsPrinting(true);
    const iframe = printIframeRef.current;
    if (!iframe) {
      setIsPrinting(false);
      return;
    }

    try {
      let html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bulk Print QR - ${room.name}</title>
            <style>
              body { font-family: sans-serif; margin: 0; padding: 20px; display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
              .qr-container { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #ccc; padding: 15px; border-radius: 8px; width: 250px; text-align: center; page-break-inside: avoid; margin-bottom: 20px; }
              img { max-width: 200px; max-height: 200px; margin-bottom: 10px; }
              h3 { margin: 0 0 5px 0; font-size: 16px; word-break: break-word; }
              p { margin: 0; font-size: 14px; color: #555; }
            </style>
          </head>
          <body>
      `;

      for (const a of assets) {
        let qrDataUrl = a.qrCode;
        if (!qrDataUrl) {
          const appUrl = typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000";
          const assetUrl = `${appUrl}/assets/${a.assetCode}`;
          qrDataUrl = await QRCode.toDataURL(assetUrl);
        }

        html += `
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="${a.assetCode}" />
            <h3>${a.assetCode}</h3>
            <p>${a.name}</p>
          </div>
        `;
      }

      html += `
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
          setIsPrinting(false);
        }, 500);
      } else {
        setIsPrinting(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR codes");
      setIsPrinting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between mr-8">
          <DialogTitle>Assets in {room?.name}</DialogTitle>
          <Button onClick={handleBulkPrint} disabled={loading || isPrinting || assets.length === 0} variant="default" size="sm">
            {isPrinting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
            {isPrinting ? "Generating..." : "Bulk Print QRs"}
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                  </TableCell>
                </TableRow>
              ) : assets.length > 0 ? (
                assets.map(asset => (
                  <TableRow key={asset.id}>
                    <TableCell className="font-medium">{asset.assetCode}</TableCell>
                    <TableCell>{asset.name}</TableCell>
                    <TableCell>{asset.category?.name}</TableCell>
                    <TableCell>{asset.status?.name}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/assets/${asset.id}`} passHref>
                        <Button variant="ghost" size="icon" title="View Asset">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                    No assets found in this room.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <iframe ref={printIframeRef} style={{ display: "none" }} title="Print Frame" />
      </DialogContent>
    </Dialog>
  );
}
