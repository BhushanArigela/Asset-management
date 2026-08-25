const fs = require('fs');
let file = 'src/components/roles/role-form-dialog.tsx';

let content = `
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Shield, X, CheckSquare, Trash2, FileText, FileCheck, ShieldCheck, PenTool, Database, ChevronDown, ChevronUp, Save } from "lucide-react";
import {
  Dialog,
  DialogContent,
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
import { Switch } from "@/components/ui/switch";

const roleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
  permissionIds: z.array(z.string()).default([]),
});

const getModuleIcon = (module: string) => {
  const m = module.toUpperCase();
  if (m === "ASSETS") return <FileText className="w-[18px] h-[18px] text-[#2563eb]" />;
  if (m === "AUDIT_LOGS") return <FileCheck className="w-[18px] h-[18px] text-[#16a34a]" />;
  if (m === "AUDITS") return <ShieldCheck className="w-[18px] h-[18px] text-[#9333ea]" />;
  if (m === "MAINTENANCE") return <PenTool className="w-[18px] h-[18px] text-[#ea580c]" />;
  if (m === "MASTERS") return <Database className="w-[18px] h-[18px] text-[#0891b2]" />;
  return <FileText className="w-[18px] h-[18px] text-gray-500" />;
};

const getModuleBg = (module: string) => {
  const m = module.toUpperCase();
  if (m === "ASSETS") return "bg-[#eff6ff]";
  if (m === "AUDIT_LOGS") return "bg-[#f0fdf4]";
  if (m === "AUDITS") return "bg-[#faf5ff]";
  if (m === "MAINTENANCE") return "bg-[#fff7ed]";
  if (m === "MASTERS") return "bg-[#ecfeff]";
  return "bg-gray-50";
};

export function RoleFormDialog({ open, onOpenChange, role, onSuccess }: any) {
  const [loading, setLoading] = useState(false);
  const [permissionsMap, setPermissionsMap] = useState<any>({});
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({ "ASSETS": true });
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
    if (open) {
      setExpandedModules({ "ASSETS": true });
      Promise.all([
        fetch(\`\${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/permissions\`).then(r => r.json()),
        isEdit ? fetch(\`\${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/roles/\${role.id}\`).then(r => r.json()) : Promise.resolve(null)
      ]).then(([permsData, roleData]) => {
        setPermissionsMap(permsData);
        if (roleData) {
          const currentPerms = roleData.rolePermissions.map((rp: any) => rp.permissionId);
          form.reset({
            name: roleData.name,
            description: roleData.description || "",
            isActive: roleData.isActive,
            permissionIds: currentPerms,
          });
        } else {
          form.reset({
            name: "",
            description: "",
            isActive: true,
            permissionIds: [],
          });
        }
      });
    }
  }, [open, role, isEdit, form]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const url = isEdit ? \`\${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/roles/\${role.id}\` : (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/roles";
      const method = isEdit ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      
      if (!res.ok) throw new Error("Failed to save role");
      
      toast.success(\`Role \${isEdit ? "updated" : "created"} successfully\`);
      onSuccess();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    const allIds = Object.values(permissionsMap).flat().map((p: any) => p.id);
    form.setValue("permissionIds", allIds);
  };

  const handleClearAll = () => {
    form.setValue("permissionIds", []);
  };

  const toggleModule = (module: string) => {
    setExpandedModules(prev => ({ ...prev, [module]: !prev[module] }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[850px] p-0 overflow-hidden bg-[#fafafa]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#2563eb] rounded-xl flex items-center justify-center shrink-0 shadow-sm text-white">
              <Shield className="w-[22px] h-[22px] fill-current" />
            </div>
            <h2 className="text-[22px] font-bold text-gray-900 leading-none">{isEdit ? "Edit Role" : "Add Role"}</h2>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6 md:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
              {/* Top Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="font-semibold text-[14px] text-gray-800 block mb-2">Role Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role name" className="h-[44px] rounded-lg border-input bg-white" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="font-semibold text-[14px] text-gray-800 block mb-2">Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role description (optional)" className="h-[44px] rounded-lg border-input bg-white" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Active Toggle */}
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 bg-white p-0 rounded-none border-none">
                    <FormControl>
                      <Switch 
                        checked={field.value} 
                        onCheckedChange={field.onChange} 
                        className="data-[state=checked]:bg-[#2563eb]"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-[14px] font-semibold text-gray-900 cursor-pointer">Active</FormLabel>
                      <p className="text-[13px] text-gray-500">This role will be active and available for assignment.</p>
                    </div>
                  </FormItem>
                )}
              />

              {/* Permissions Matrix */}
              <div className="space-y-4 pt-2">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-[16px] font-bold text-gray-900 leading-none mb-1">Permissions</h3>
                    <p className="text-[13px] text-gray-500">Select the permissions this role should have.</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button type="button" onClick={handleSelectAll} className="flex items-center gap-1.5 text-[13px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                      <CheckSquare className="w-4 h-4" />
                      Select All
                    </button>
                    <button type="button" onClick={handleClearAll} className="flex items-center gap-1.5 text-[13px] font-semibold text-gray-500 hover:text-gray-700 transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <FormField
                    control={form.control}
                    name="permissionIds"
                    render={({ field }) => (
                      <>
                        {Object.entries(permissionsMap).map(([module, perms]: any) => {
                          const safePerms = Array.isArray(perms) ? perms : [];
                          const isExpanded = expandedModules[module];

                          return (
                            <div key={module} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm transition-all">
                              {/* Header (Accordion Toggle) */}
                              <div 
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                onClick={() => toggleModule(module)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={\`w-8 h-8 rounded-lg flex items-center justify-center \${getModuleBg(module)}\`}>
                                    {getModuleIcon(module)}
                                  </div>
                                  <h4 className="font-bold text-[13px] text-gray-900 uppercase tracking-wide">{module}</h4>
                                </div>
                                <div>
                                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </div>
                              </div>
                              
                              {/* Content */}
                              {isExpanded && (
                                <div className="p-4 pt-0 border-t border-gray-100 bg-white">
                                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-6 mt-4 ml-2">
                                    {safePerms.map((p: any) => (
                                      <div key={p.id} className="flex items-center space-x-3">
                                        <Checkbox
                                          id={\`perm-\${p.id}\`}
                                          checked={field.value?.includes(p.id)}
                                          onCheckedChange={(checked) => {
                                            if (checked) field.onChange([...(field.value || []), p.id]);
                                            else field.onChange((field.value || []).filter((id: string) => id !== p.id));
                                          }}
                                          className="data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb] rounded-sm w-[18px] h-[18px]"
                                        />
                                        <label htmlFor={\`perm-\${p.id}\`} className="text-[14px] text-gray-700 cursor-pointer font-medium select-none">
                                          {p.action}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-white">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6 h-[42px] rounded-lg font-semibold text-[14px] text-gray-700 border-gray-200">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#2563eb] hover:bg-blue-700 text-white px-6 h-[42px] rounded-lg font-semibold text-[14px]">
                <Save className="w-4 h-4 mr-2" />
                {isEdit ? "Update Role" : "Save Role"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
`;
fs.writeFileSync(file, content);
console.log("Done");
