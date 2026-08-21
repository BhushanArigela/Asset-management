"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Eye, Plus } from "lucide-react";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export function MaintenanceListPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const { data: requests, isLoading } = useQuery({
    queryKey: ["maintenance"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/maintenance`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const canCreate = hasPermission(session?.user?.permissions, [PERMISSIONS.CREATE_MAINTENANCE] as any);

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "requestNumber",
      header: "Number",
    },
    {
      id: "asset",
      header: "Asset",
      accessorFn: (row) => `${row.asset?.name || ''} (${row.asset?.assetCode || ''})`,
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => <Badge variant="outline">{row.original.priority}</Badge>,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <Badge>{row.original.status}</Badge>,
    },
    {
      accessorKey: "createdAt",
      header: "Created",
      cell: ({ row }) => formatDateTime(row.original.createdAt),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="sm" onClick={() => router.push(`/maintenance/${row.original.id}`)}>
          <Eye className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">Maintenance Requests</h2>
        {canCreate && (
          <Button onClick={() => router.push("/maintenance/new")}><Plus className="h-4 w-4 mr-2" /> Raise Request</Button>
        )}
      </div>
      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <DataTable columns={columns} data={requests || []} />
      )}
    </div>
  );
}
