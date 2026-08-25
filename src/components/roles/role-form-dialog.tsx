"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  permissionIds: z.array(z.string()).default([]),
});

export function RoleFormDialog({ open, onOpenChange, role, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [permissionsMap, setPermissionsMap] = useState<any>({});
  const isEdit = !!role;

  const form = useForm({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: role?.name || "",
      description: role?.description || "",
      isActive: role?.isActive ?? true,
      permissionIds: [],
    },
  });

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/permissions`).then(r => r.json()),
      isEdit ? fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/roles/${role.id}`).then(r => r.json()) : Promise.resolve(null)
    ]).then(([permsData, roleData]) => {
      setPermissionsMap(permsData);
      if (roleData) {
        const currentPerms = roleData.rolePermissions.map((rp: any) => rp.permissionId);
        form.setValue("permissionIds", currentPerms);
      }
    });
  }, [role, isEdit, form]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = isEdit ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/roles/${role.id}` : (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/roles";
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (!res.ok) throw new Error("Failed to save role");
      
      toast.success(`Role ${isEdit ? "updated" : "created"} successfully`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModuleSelect = (module: string, checked: boolean) => {
    const current = form.getValues("permissionIds") || [];
    const modulePermIds = permissionsMap[module].map((p: any) => p.id);
    
    if (checked) {
      const added = [...current, ...modulePermIds].filter((v, i, a) => a.indexOf(v) === i);
      form.setValue("permissionIds", added);
    } else {
      const removed = current.filter((id: string) => !modulePermIds.includes(id));
      form.setValue("permissionIds", removed);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Role" : "Add Role"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Input {...field} value={field.value || ""} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-2">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel>Active</FormLabel>
                </FormItem>
              )}
            />

            <div className="space-y-3">
              <h3 className="font-medium text-lg border-b pb-2">Permissions Matrix</h3>
              <FormField
                control={form.control}
                name="permissionIds"
                render={({ field }) => (
                  <div className="space-y-3">
                    {Object.entries(permissionsMap).map(([module, perms]: any) => {
                      const safePerms = Array.isArray(perms) ? perms : [];
                      const modulePermIds = safePerms.map((p: any) => p.id);
                      const currentVal = field.value || [];
                      const allSelected = modulePermIds.every((id: string) => currentVal.includes(id));
                      const someSelected = modulePermIds.some((id: string) => currentVal.includes(id)) && !allSelected;

                      return (
                        <div key={module} className="border p-4 rounded-md">
                          <div className="flex items-center space-x-2 mb-4 border-b pb-2">
                            <Checkbox 
                              checked={allSelected ? true : someSelected ? "indeterminate" : false}
                              onCheckedChange={(checked) => handleModuleSelect(module, checked as boolean)}
                            />
                            <h4 className="font-medium uppercase">{module}</h4>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            {perms.map((p: any) => (
                              <div key={p.id} className="flex items-center space-x-2">
                                <Checkbox
                                  checked={field.value?.includes(p.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) field.onChange([...(field.value || []), p.id]);
                                    else field.onChange((field.value || []).filter((id: string) => id !== p.id));
                                  }}
                                />
                                <span className="text-sm">{p.action}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="mr-2">Cancel</Button>
              <Button type="submit" disabled={loading} className="bg-[#1B2A4A] text-white">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
