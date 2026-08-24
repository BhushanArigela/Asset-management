"use client";

import { useState, useEffect } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Plus, Edit, Trash } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";

import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { RoleFormDialog } from "./role-form-dialog";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export function RoleListPage() {
  const { data: session } = useSession();
  const canCreateRole = hasPermission(session?.user?.permissions, [PERMISSIONS.ROLES_CREATE] as any);
  const canEditRole = hasPermission(session?.user?.permissions, [PERMISSIONS.ROLES_EDIT] as any);
  const canDeleteRole = hasPermission(session?.user?.permissions, [PERMISSIONS.ROLES_DELETE] as any);

  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any | null>(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/roles`);
      if (!res.ok) throw new Error("Failed to fetch roles");
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      toast.error("Error loading roles");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this role?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/roles/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete role");
      toast.success("Role deactivated successfully");
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || "Error deleting role");
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => row.getValue("description") || "N/A",
    },
    {
      accessorKey: "_count.users",
      header: "Users",
    },
    {
      accessorKey: "_count.rolePermissions",
      header: "Permissions",
    },
    {
      accessorKey: "isActive",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("isActive") as boolean;
        return (
          <Badge variant={isActive ? "default" : "destructive"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const role = row.original;
          
          if (!canEditRole && !canDeleteRole) {
            return null;
          }

          return (
            <div className="flex gap-2">
              {canEditRole && (
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => {
                  setSelectedRole(role);
                  setIsDialogOpen(true);
                }} title="Edit Role">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canDeleteRole && role.isActive && (
                <Button variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(role.id)} title="Deactivate Role">
                  <Trash className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      },
  ];

  

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div />
        {canCreateRole && (
          <Button 
            className="bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white"
            onClick={() => {
              setSelectedRole(null);
              setIsDialogOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Role
          </Button>
        )}
      </div>

      <DataTable columns={columns} data={roles} />

      {isDialogOpen && (
        <RoleFormDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          role={selectedRole}
          onSuccess={() => {
            setIsDialogOpen(false);
            fetchRoles();
          }}
        />
      )}
    </div>
  );
}
