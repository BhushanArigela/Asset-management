"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Movement History</h2>
      <Card>
        <CardHeader>
          <CardTitle>All Transfers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Asset</TableHead>
                <TableHead>From Building</TableHead>
                <TableHead>To Building</TableHead>
                <TableHead>Processed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>
              ) : !movements?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center">No movements found.</TableCell></TableRow>
              ) : (
                movements.map((m: any) => (
                  <TableRow key={m.id}>
                    <TableCell>{formatDateTime(m.transferDate)}</TableCell>
                    <TableCell>{m.asset?.name} ({m.asset?.assetCode})</TableCell>
                    <TableCell>{m.fromBuilding?.name || "N/A"}</TableCell>
                    <TableCell>{m.toBuilding?.name}</TableCell>
                    <TableCell>{m.transferredBy?.name}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
