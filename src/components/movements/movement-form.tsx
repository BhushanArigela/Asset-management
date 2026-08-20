"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  assetId: z.string().min(1, "Asset ID is required"),
  toCompanyId: z.string().min(1, "Company is required"),
  toBuildingId: z.string().min(1, "Building is required"),
  toFloorId: z.string().min(1, "Floor is required"),
  toRoomId: z.string().optional(),
  toDepartmentId: z.string().optional(),
  toResponsiblePerson: z.string().optional(),
  reason: z.string().min(1, "Reason is required"),
  remarks: z.string().optional(),
});

export function MovementForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultAssetId = searchParams.get("assetId") || "";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [assets, setAssets] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/companies`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/buildings`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/floors`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/rooms`).then(r => r.json()),
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/departments`).then(r => r.json()),
    ]).then(([ast, comp, bldg, flr, rm, dept]) => {
      setAssets(ast.data || ast || []);
      setCompanies(comp.data || []);
      setBuildings(bldg.data || []);
      setFloors(flr.data || []);
      setRooms(rm.data || []);
      setDepartments(dept.data || []);
    });
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      assetId: defaultAssetId,
      toCompanyId: "",
      toBuildingId: "",
      toFloorId: "",
      toRoomId: "",
      toDepartmentId: "",
      toResponsiblePerson: "",
      reason: "",
      remarks: "",
    },
  });

  const selectedCompanyId = form.watch("toCompanyId");
  const selectedBuildingId = form.watch("toBuildingId");
  const selectedFloorId = form.watch("toFloorId");

  const filteredBuildings = selectedCompanyId ? buildings.filter(b => b.companyId === selectedCompanyId) : buildings;
  const filteredFloors = selectedBuildingId ? floors.filter(f => f.buildingId === selectedBuildingId) : floors;
  const filteredRooms = selectedFloorId ? rooms.filter(r => r.floorId === selectedFloorId) : rooms;

  // Auto-clear downstream fields when parent changes
  useEffect(() => {
    form.setValue("toBuildingId", "");
    form.setValue("toFloorId", "");
    form.setValue("toRoomId", "");
  }, [selectedCompanyId, form]);

  useEffect(() => {
    form.setValue("toFloorId", "");
    form.setValue("toRoomId", "");
  }, [selectedBuildingId, form]);

  useEffect(() => {
    form.setValue("toRoomId", "");
  }, [selectedFloorId, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${values.assetId}/movements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) throw new Error("Failed to transfer asset");
      
      toast.success("Asset transferred successfully");
      router.push("/movements");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField control={form.control} name="assetId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Asset" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {assets.map(a => <SelectItem key={a.id} value={a.id}>{a.code} - {a.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="toCompanyId" render={({ field }) => (
                <FormItem>
                  <FormLabel>To Company</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="toBuildingId" render={({ field }) => (
                <FormItem>
                  <FormLabel>To Building</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedCompanyId}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Building" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredBuildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="toFloorId" render={({ field }) => (
                <FormItem>
                  <FormLabel>To Floor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedBuildingId}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Floor" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredFloors.map(f => <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="toRoomId" render={({ field }) => (
                <FormItem>
                  <FormLabel>To Room (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value} disabled={!selectedFloorId}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredRooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name} ({r.code})</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="toDepartmentId" render={({ field }) => (
                <FormItem>
                  <FormLabel>To Department (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="reason" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Reason</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="remarks" render={({ field }) => (
                <FormItem className="md:col-span-2"><FormLabel>Remarks</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Transferring..." : "Transfer"}</Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
