"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function MaintenanceDetailPage({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState("");

  const { data: mr, isLoading } = useQuery({
    queryKey: ["maintenance", id],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/maintenance/${id}`);
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/maintenance/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Failed to update");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["maintenance", id] });
      setIsUpdateModalOpen(false);
      setNotes("");
      toast.success("Maintenance request updated successfully");
    },
    onError: (err: any) => toast.error(err.message),
  });

  if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-muted-foreground w-8 h-8" /></div>;
  if (!mr) return <div>Request not found.</div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <div className="text-sm text-muted-foreground font-medium mb-1">Request {mr.requestNumber}</div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">{mr.asset?.name} ({mr.asset?.assetCode})</h2>
        </div>
        <Button onClick={() => {
          setStatus(mr.status);
          setNotes("");
          setIsUpdateModalOpen(true);
        }}>Update Status</Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div><span className="font-semibold text-slate-600 block text-sm">Priority:</span> {mr.priority}</div>
              <div><span className="font-semibold text-slate-600 block text-sm">Current Status:</span> <Badge>{mr.status}</Badge></div>
              <div><span className="font-semibold text-slate-600 block text-sm">Created:</span> {formatDateTime(mr.createdAt)}</div>
              <div><span className="font-semibold text-slate-600 block text-sm">Problem Description:</span> <div className="bg-slate-50 p-3 rounded mt-1 text-sm">{mr.description}</div></div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader><CardTitle>Updates Timeline</CardTitle></CardHeader>
            <CardContent>
              {mr.updates && mr.updates.length > 0 ? (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
                  {mr.updates.map((update: any) => (
                    <div key={update.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border shadow-sm">
                        <div className="flex items-center justify-between space-x-2 mb-1">
                          <div className="font-bold text-slate-700">{update.createdBy?.name || "System"}</div>
                          <div className="text-xs text-slate-500">{formatDateTime(update.createdAt)}</div>
                        </div>
                        {update.statusChangedTo && (
                          <div className="mb-2"><Badge variant="outline">Status: {update.statusChangedTo}</Badge></div>
                        )}
                        <div className="text-slate-600 text-sm">{update.notes}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">No updates yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OPEN">Open</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="ON_HOLD">On Hold</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes / Update Description</label>
              <Textarea 
                placeholder="Describe what was done..." 
                value={notes} 
                onChange={e => setNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateModalOpen(false)}>Cancel</Button>
            <Button onClick={() => updateMutation.mutate({ status, notes })} disabled={updateMutation.isPending || (!notes && status === mr.status)}>
              {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
