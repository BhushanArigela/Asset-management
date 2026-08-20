"use client";

import { useEffect, useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Printer, Eye } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export function RoomAssetsModal({ room, open, onOpenChange }: { room: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const [loading, setLoading] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

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

  const handleBulkPrint = () => {
    const assetsWithQr = assets.filter(a => a.qrCode);
    if (assetsWithQr.length === 0) {
      toast.error("No QR codes found for assets in this room");
      return;
    }

    const iframe = printIframeRef.current;
    if (!iframe) return;

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

    assetsWithQr.forEach(a => {
      html += `
        <div class="qr-container">
          <img src="${a.qrCode}" alt="${a.assetCode}" />
          <h3>${a.assetCode}</h3>
          <p>${a.name}</p>
        </div>
      `;
    });

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
      }, 500);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] flex flex-col">
        <DialogHeader className="flex flex-row items-center justify-between mr-8">
          <DialogTitle>Assets in {room?.name}</DialogTitle>
          <Button onClick={handleBulkPrint} disabled={loading || assets.length === 0} variant="default" size="sm">
            <Printer className="w-4 h-4 mr-2" /> Bulk Print QRs
          </Button>
        </DialogHeader>

        <div className="flex-1 overflow-auto mt-4 border rounded-md">
          <Table>
            <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>QR</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
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
                    <TableCell>
                      {asset.qrCode ? <span className="text-green-600 text-xs font-semibold">Ready</span> : <span className="text-muted-foreground text-xs">None</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/assets/${asset.id}`} passHref>
                        <Button variant="ghost" size="icon" title="View Asset">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
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
