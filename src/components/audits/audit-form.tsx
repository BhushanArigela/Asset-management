"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

export function AuditForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    scopeType: "Company",
    scopeId: "all",
    auditorId: userId,
    auditDate: new Date().toISOString().split("T")[0],
    notes: ""
  });

  const { data: users = [] } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/users?limit=1000`);
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      return data.data || [];
    },
  });

  const { data: buildings = [] } = useQuery({
    queryKey: ["buildings"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/buildings`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.data || [];
    },
    enabled: formData.scopeType === "Building",
  });

  const { data: rooms = [] } = useQuery({
    queryKey: ["rooms"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/rooms`);
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      return data.data || [];
    },
    enabled: formData.scopeType === "Room",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/audits`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create audit");

      const newAudit = await res.json();
      toast.success("Audit session created successfully!");
      router.push(`/audits/${newAudit.id}`);
    } catch (error) {
      toast.error("Failed to create audit session");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Audit Name</Label>
            <Input 
              id="name" 
              required 
              placeholder="e.g. Q3 IT Assets Audit"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Scope Type</Label>
              <Select value={formData.scopeType} onValueChange={(v) => setFormData({...formData, scopeType: v, scopeId: v === "Company" ? "all" : ""})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Company">Company-wide</SelectItem>
                  <SelectItem value="Building">Specific Building</SelectItem>
                  <SelectItem value="Room">Specific Room</SelectItem>
                  <SelectItem value="Department">Specific Department</SelectItem>
                  <SelectItem value="Category">Specific Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Scope Value</Label>
              {formData.scopeType === "Company" ? (
                <Input value="all" disabled />
              ) : formData.scopeType === "Building" ? (
                <Select value={formData.scopeId} onValueChange={(v) => setFormData({...formData, scopeId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Building" /></SelectTrigger>
                  <SelectContent>
                    {buildings.map((b: any) => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : formData.scopeType === "Room" ? (
                <Select value={formData.scopeId} onValueChange={(v) => setFormData({...formData, scopeId: v})}>
                  <SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger>
                  <SelectContent>
                    {rooms.map((r: any) => (
                      <SelectItem key={r.id} value={r.id}>{r.name} ({r.code})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input 
                  id="scopeId" 
                  placeholder={`Enter ${formData.scopeType} ID`}
                  value={formData.scopeId}
                  onChange={(e) => setFormData({...formData, scopeId: e.target.value})}
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="auditorId">Auditor</Label>
              <Select value={formData.auditorId} onValueChange={(v) => setFormData({...formData, auditorId: v})}>
                <SelectTrigger><SelectValue placeholder="Select Auditor" /></SelectTrigger>
                <SelectContent>
                  {users.map((u: any) => (
                    <SelectItem key={u.id} value={u.id}>{u.name} ({u.email})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auditDate">Audit Date</Label>
              <Input 
                id="auditDate" 
                type="date" 
                required 
                value={formData.auditDate}
                onChange={(e) => setFormData({...formData, auditDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              placeholder="Any specific instructions..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" className="bg-[#1B2A4A]" disabled={loading}>
              {loading ? "Creating..." : "Create Audit"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
