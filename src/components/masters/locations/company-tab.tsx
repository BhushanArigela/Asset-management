"use client";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CompanyFormDialog } from "./company-form-dialog";

export function CompanyTab() {
  const { data: session } = useSession();
  const canCreateMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_CREATE] as any);
  const canEditMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_EDIT] as any);

  const [data, setData] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  
  const fetchCompanies = () => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/companies`).then(r => r.json()).then(d => setData(d.data || []));
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const columns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "code", header: "Code" },
    { accessorKey: "address", header: "Address", cell: ({ row }) => row.original.address || "-" },
    { 
      id: "contact", 
      header: "Contact Details", 
      cell: ({ row }) => {
        const c = row.original;
        if (!c.contactPerson && !c.phone && !c.email) return "-";
        return (
          <div className="flex flex-col">
            {c.contactPerson && <span className="font-medium">{c.contactPerson}</span>}
            {c.phone && <span className="text-xs text-gray-500">{c.phone}</span>}
            {c.email && <span className="text-xs text-gray-500">{c.email}</span>}
          </div>
        );
      }
    },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    )},
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (<>{canEditMaster && (<Button variant="ghost" size="icon" onClick={() => {
          setSelectedCompany(row.original);
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
            setSelectedCompany(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4"/> Add Company
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
      
      {isDialogOpen && (
        <CompanyFormDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          initialData={selectedCompany}
          onSuccess={() => {
            setIsDialogOpen(false);
            fetchCompanies();
          }} 
        />
      )}
    </div>
  );
}
