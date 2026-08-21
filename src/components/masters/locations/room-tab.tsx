"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RoomFormDialog } from "./room-form-dialog";
import { RoomAssetsModal } from "./room-assets-modal";
import { QrCode, Printer } from "lucide-react";

export function RoomTab() {
  const [data, setData] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [qrRoom, setQrRoom] = useState<any>(null);
  const [assetsModalRoom, setAssetsModalRoom] = useState<any>(null);
  
  const fetchRooms = () => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/rooms`).then(r => r.json()).then(d => setData(d.data || []));
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const columns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "code", header: "Code" },
    { accessorKey: "floor.name", header: "Floor" },
    { accessorKey: "roomType", header: "Type" },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    )},
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={() => setAssetsModalRoom(row.original)} title="View Assets">
            <Box className="h-4 w-4" />
          </Button>
          {row.original.qrCode && (
            <Button variant="ghost" size="icon" onClick={() => setQrRoom(row.original)} title="View QR">
              <QrCode className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={() => {
            setSelectedRoom(row.original);
            setIsDialogOpen(true);
          }}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          className="bg-[#1B2A4A] text-white"
          onClick={() => {
            setSelectedRoom(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4"/> Add Room
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
      
      {isDialogOpen && (
        <RoomFormDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          initialData={selectedRoom}
          onSuccess={() => {
            setIsDialogOpen(false);
            fetchRooms();
          }} 
        />
      )}

      {qrRoom && (
        <Dialog open={!!qrRoom} onOpenChange={(o) => !o && setQrRoom(null)}>
          <DialogContent className="sm:max-w-md flex flex-col items-center justify-center py-10">
            <DialogHeader>
              <DialogTitle>Room QR Code</DialogTitle>
            </DialogHeader>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrRoom.qrCode} alt="Room QR Code" className="w-48 h-48" />
            </div>
            <p className="mt-4 text-sm text-slate-500 font-mono bg-slate-100 px-3 py-1 rounded-md">{qrRoom.code}</p>
            <Button className="mt-4" onClick={() => {
              const win = window.open();
              if (win) {
                win.document.write(`
                  <html>
                    <head><title>Print QR - ${qrRoom.code}</title></head>
                    <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;">
                      <img src="${qrRoom.qrCode}" style="width:300px;height:300px;margin-bottom:20px;" />
                      <h1 style="margin:0;font-size:24px;">${qrRoom.code}</h1>
                      <script>setTimeout(() => { window.print(); window.close(); }, 500);</script>
                    </body>
                  </html>
                `);
                win.document.close();
              }
            }}>
              <Printer className="mr-2 h-4 w-4" /> Print QR
            </Button>
          </DialogContent>
        </Dialog>
      )}

      {assetsModalRoom && (
        <RoomAssetsModal 
          room={assetsModalRoom} 
          open={!!assetsModalRoom} 
          onOpenChange={(o) => !o && setAssetsModalRoom(null)} 
        />
      )}
    </div>
  );
}
