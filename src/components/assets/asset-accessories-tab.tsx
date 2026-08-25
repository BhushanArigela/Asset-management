"use client";

import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash, Printer, QrCode } from "lucide-react";

export function AssetAccessoriesTab({ assetId, accessories }: { assetId: string; accessories: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [generateQr, setGenerateQr] = useState(false);

  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState<{ qrCode: string; name: string } | null>(null);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${assetId}/accessories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, serialNumber, generateQr }),
      });
      if (!res.ok) throw new Error("Failed to add accessory");
      
      toast.success("Accessory added successfully");
      setOpen(false);
      setName("");
      setSerialNumber("");
      setGenerateQr(false);
      queryClient.invalidateQueries({ queryKey: ["asset", assetId] });
    } catch (error) {
      toast.error("Failed to add accessory");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (accessoryId: string) => {
    if (!confirm("Are you sure you want to delete this accessory?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${assetId}/accessories/${accessoryId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Accessory deleted");
      queryClient.invalidateQueries({ queryKey: ["asset", assetId] });
    } catch (error) {
      toast.error("Failed to delete accessory");
    }
  };

  const handleGenerateQR = async (accessoryId: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${assetId}/accessories/${accessoryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ generateQr: true }),
      });
      if (!res.ok) throw new Error("Failed to generate QR");
      toast.success("QR Code generated");
      queryClient.invalidateQueries({ queryKey: ["asset", assetId] });
    } catch (error) {
      toast.error("Failed to generate QR code");
    }
  };

  const handleViewQR = (qrCode: string, name: string) => {
    setSelectedQr({ qrCode, name });
    setQrModalOpen(true);
  };

  const handlePrintQR = () => {
    if (!selectedQr) return;
    const iframe = printIframeRef.current;
    if (!iframe) return;

    const html = `
      <!DOCTYPE html>
      <html>
        <head><title>Print QR - ${selectedQr.name}</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;">
          <img src="${selectedQr.qrCode}" style="width:300px;height:300px;margin-bottom:20px;" />
          <h1 style="margin:0;font-size:24px;">${selectedQr.name}</h1>
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
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Accessories & Components</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm">Add Accessory</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Accessory</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="-y-3">
                <div className="space-y-2">
                  <Label>Name / Description</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g., Laptop Charger" />
                </div>
                <div className="space-y-2">
                  <Label>Serial Number (Optional)</Label>
                  <Input value={serialNumber} onChange={(e) => setSerialNumber(e.target.value)} placeholder="e.g., CHG-12345" />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <input type="checkbox" id="generateQr" checked={generateQr} onChange={(e) => setGenerateQr(e.target.checked)} className="w-4 h-4" />
                  <Label htmlFor="generateQr" className="cursor-pointer">Generate QR Code for this accessory</Label>
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? "Adding..." : "Add Accessory"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Added On</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accessories?.length ? (
                accessories.map((acc: any) => (
                  <TableRow key={acc.id}>
                    <TableCell className="font-medium">{acc.name}</TableCell>
                    <TableCell>{acc.serialNumber || "N/A"}</TableCell>
                    <TableCell>{new Date(acc.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                      {acc.qrCode ? (
                        <Button variant="outline" size="sm" onClick={() => handleViewQR(acc.qrCode, acc.name)}>
                          <Printer className="w-4 h-4 mr-1" /> View & Print QR
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" onClick={() => handleGenerateQR(acc.id)}>
                          <QrCode className="w-4 h-4 mr-1" /> Generate QR
                        </Button>
                      )}
                      <Button variant="destructive" size="icon" onClick={() => handleDelete(acc.id)}>
                        <Trash className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                    No accessories added yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={qrModalOpen} onOpenChange={setQrModalOpen}>
        <DialogContent className="sm:max-w-md flex flex-col items-center justify-center p-6">
          <DialogHeader>
            <DialogTitle className="text-center">Accessory QR Code</DialogTitle>
          </DialogHeader>
          
          {selectedQr && (
            <div className="-y-3">
              <img src={selectedQr.qrCode} alt={selectedQr.name} className="w-64 h-64 border rounded-md" />
              <h2 className="text-2xl font-bold tracking-tight">{selectedQr.name}</h2>
            </div>
          )}

          <Button onClick={handlePrintQR} disabled={!selectedQr} className="w-full mt-4">
            <Printer className="mr-2 h-4 w-4" /> Print
          </Button>
          <iframe ref={printIframeRef} style={{ display: "none" }} title="Print Frame" />
        </DialogContent>
      </Dialog>
    </>
  );
}
