"use client";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { FloorFormDialog } from "./floor-form-dialog";

export function FloorTab() {
  const { data: session } = useSession();
  const canCreateMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_CREATE] as any);
  const canEditMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_EDIT] as any);

  const [data, setData] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<any>(null);
  
  const fetchFloors = () => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/floors`).then(r => r.json()).then(d => setData(d.data || []));
  };

  useEffect(() => {
    fetchFloors();
  }, []);

  const columns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "code", header: "Code" },
    { accessorKey: "building.name", header: "Building" },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
      <Badge variant="outline" className={row.original.isActive ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    )},
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (<>{canEditMaster && (<Button variant="ghost" size="icon" onClick={() => {
          setSelectedFloor(row.original);
          setIsDialogOpen(true);
        }}>
          <Edit className="h-4 w-4" />
        </Button>)}</>)
    }
  ];

  return (
    <div>
      <div className="absolute top-6 right-4 md:right-8">
        <Button 
          className="bg-[#1B2A4A] text-white"
          onClick={() => {
            setSelectedFloor(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4"/> Add Floor
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
      
      {isDialogOpen && (
        <FloorFormDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          initialData={selectedFloor}
          onSuccess={() => {
            setIsDialogOpen(false);
            fetchFloors();
          }} 
        />
      )}
    </div>
  );
}
