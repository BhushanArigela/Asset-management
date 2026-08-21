"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { CompanyFormDialog } from "./company-form-dialog";

export function CompanyTab() {
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
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "default" : "destructive"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    )},
    {
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" onClick={() => {
          setSelectedCompany(row.original);
          setIsDialogOpen(true);
        }}>
          <Edit className="h-4 w-4" />
        </Button>
      )
    }
  ];

  return (
    <div>
      <div className="flex justify-end mb-4">
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
