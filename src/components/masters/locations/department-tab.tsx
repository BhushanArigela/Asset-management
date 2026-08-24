"use client";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { DepartmentFormDialog } from "./department-form-dialog";

export function DepartmentTab() {
  const { data: session } = useSession();
  const canCreateMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_CREATE] as any);
  const canEditMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_EDIT] as any);

  const [data, setData] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  
  const fetchDepartments = () => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/departments`).then(r => r.json()).then(d => setData(d.data || []));
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const columns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "code", header: "Code" },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    )},
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (<>{canEditMaster && (<Button variant="ghost" size="icon" onClick={() => {
          setSelectedDepartment(row.original);
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
            setSelectedDepartment(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4"/> Add Department
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
      
      {isDialogOpen && (
        <DepartmentFormDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          initialData={selectedDepartment}
          onSuccess={() => {
            setIsDialogOpen(false);
            fetchDepartments();
          }} 
        />
      )}
    </div>
  );
}
