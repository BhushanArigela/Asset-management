"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";

export function MovementListPage() {
  const { data: movements, isLoading } = useQuery({
    queryKey: ["movements"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/movements`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "transferDate",
      header: "Date",
      cell: ({ row }) => formatDateTime(row.original.transferDate),
    },
    {
      id: "asset",
      header: "Asset",
      accessorFn: (row) => `${row.asset?.name || ''} (${row.asset?.assetCode || ''})`,
    },
    {
      id: "fromLocation",
      header: "From Location",
      accessorFn: (row) => [row.fromBuilding?.name, row.fromFloor?.name, row.fromRoom?.name].filter(Boolean).join(" -> ") || "N/A",
    },
    {
      id: "toLocation",
      header: "To Location",
      accessorFn: (row) => [row.toBuilding?.name, row.toFloor?.name, row.toRoom?.name].filter(Boolean).join(" -> ") || "N/A",
    },
    {
      id: "processedBy",
      header: "Processed By",
      accessorFn: (row) => row.transferredBy?.name || '',
    },
  ];

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-2xl font-bold tracking-tight">Movement History</h2>
      {isLoading ? (
        <div className="text-center py-4">Loading...</div>
      ) : (
        <DataTable columns={columns} data={movements || []} />
      )}
    </div>
  );
}
