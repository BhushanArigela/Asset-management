"use client";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";
import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { SubCategoryFormDialog } from "./sub-category-form-dialog";

export function SubCategoryTab() {
  const { data: session } = useSession();
  const canCreateMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_CREATE] as any);
  const canEditMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_EDIT] as any);

  const [data, setData] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  
  const fetchData = () => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/sub-categories`).then(r => r.json()).then(d => setData(d.data || []));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const columns: ColumnDef<any>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "code", header: "Code" },
    { accessorKey: "category.name", header: "Category" },
    { accessorKey: "isActive", header: "Status", cell: ({ row }) => (<Badge variant="outline" className={row.original.isActive ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}>{row.original.isActive ? "Active" : "Inactive"}</Badge>) },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (<>{canEditMaster && (<Button variant="ghost" size="icon" onClick={() => {
          setSelectedItem(row.original);
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
            setSelectedItem(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4"/> Add Sub-Category
        </Button>
      </div>
      <DataTable columns={columns} data={data} />
      
      {isDialogOpen && (
        <SubCategoryFormDialog 
          open={isDialogOpen} 
          onOpenChange={setIsDialogOpen} 
          initialData={selectedItem}
          onSuccess={() => {
            setIsDialogOpen(false);
            fetchData();
          }} 
        />
      )}
    </div>
  );
}
