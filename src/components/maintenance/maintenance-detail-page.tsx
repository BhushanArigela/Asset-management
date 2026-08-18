"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function MaintenanceDetailPage({ id }: { id: string }) {
  const { data: mr, isLoading } = useQuery({
    queryKey: ["maintenance", id],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/maintenance/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!mr) return <div>Request not found.</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight">{mr.requestNumber}</h2>
        <Button>Update Status</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <div><span className="font-semibold">Asset:</span> {mr.asset?.name} ({mr.asset?.assetCode})</div>
            <div><span className="font-semibold">Priority:</span> {mr.priority}</div>
            <div><span className="font-semibold">Status:</span> <Badge>{mr.status}</Badge></div>
            <div><span className="font-semibold">Created:</span> {formatDateTime(mr.createdAt)}</div>
            <div><span className="font-semibold">Problem:</span> {mr.problemDescription}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
