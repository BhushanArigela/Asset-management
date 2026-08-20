"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Trash, Printer } from "lucide-react";

export function AssetAccessoriesTab({ assetId, accessories }: { assetId: string; accessories: any[] }) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [serialNumber, setSerialNumber] = useState("");
  const [generateQr, setGenerateQr] = useState(false);

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

  const handlePrintQR = (qrCode: string, name: string) => {
    const newWindow = window.open();
    if (newWindow) {
      newWindow.document.write(`
        <html>
          <head>
            <title>Print QR - ${name}</title>
            <style>
              body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              img { max-width: 300px; }
              h2 { margin-top: 20px; }
            </style>
          </head>
          <body>
            <img src="${qrCode}" alt="QR Code" />
            <h2>${name}</h2>
            <script>
              window.onload = () => { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
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
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
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
                    {acc.qrCode && (
                      <Button variant="outline" size="sm" onClick={() => handlePrintQR(acc.qrCode, acc.name)}>
                        <Printer className="w-4 h-4 mr-1" /> QR
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
  );
}
