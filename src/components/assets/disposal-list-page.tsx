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

export function DisposalListPage() {
  const { data: assets, isLoading } = useQuery({
    queryKey: ["disposed-assets"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets?isDisposed=true`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const list = assets?.data || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">Disposed Assets</h2>
      <Card>
        <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={3} className="text-center">Loading...</TableCell></TableRow>
              ) : !list.length ? (
                <TableRow><TableCell colSpan={3} className="text-center">No disposed assets found.</TableCell></TableRow>
              ) : (
                list.map((a: any) => (
                  <TableRow key={a.id}>
                    <TableCell>{a.assetCode}</TableCell>
                    <TableCell>{a.name}</TableCell>
                    <TableCell>{a.category?.name}</TableCell>
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
