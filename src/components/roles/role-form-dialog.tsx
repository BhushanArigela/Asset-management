
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Shield, X, CheckSquare, Trash2, FileText, FileCheck, ShieldCheck, PenTool, Database, ChevronDown, ChevronUp, Save, User, Box, Info, ArrowRightLeft, BarChart3, UserCog, Settings, Users } from "lucide-react";
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
  if (m === "ASSETS") return <Box className="w-[20px] h-[20px] text-[#2563eb]" />;
  if (m === "AUDIT_LOGS") return <FileCheck className="w-[20px] h-[20px] text-[#16a34a]" />;
  if (m === "AUDITS") return <ShieldCheck className="w-[20px] h-[20px] text-[#9333ea]" />;
  if (m === "MAINTENANCE") return <PenTool className="w-[20px] h-[20px] text-[#ea580c]" />;
  if (m === "MASTERS") return <Database className="w-[20px] h-[20px] text-[#0891b2]" />;
  if (m === "MOVEMENTS") return <ArrowRightLeft className="w-[20px] h-[20px] text-[#d97706]" />;
  if (m === "REPORTS") return <BarChart3 className="w-[20px] h-[20px] text-[#4f46e5]" />;
  if (m === "ROLES") return <UserCog className="w-[20px] h-[20px] text-[#e11d48]" />;
  if (m === "SETTINGS") return <Settings className="w-[20px] h-[20px] text-[#0d9488]" />;
  if (m === "USERS") return <Users className="w-[20px] h-[20px] text-[#0ea5e9]" />;
  return <FileText className="w-[20px] h-[20px] text-gray-500" />;
};

const getModuleBg = (module: string) => {
  const m = module.toUpperCase();
  if (m === "ASSETS") return "bg-[#eff6ff]";
  if (m === "AUDIT_LOGS") return "bg-[#f0fdf4]";
  if (m === "AUDITS") return "bg-[#faf5ff]";
  if (m === "MAINTENANCE") return "bg-[#fff7ed]";
  if (m === "MASTERS") return "bg-[#ecfeff]";
  if (m === "MOVEMENTS") return "bg-[#fffbeb]";
  if (m === "REPORTS") return "bg-[#eef2ff]";
  if (m === "ROLES") return "bg-[#fff1f2]";
  if (m === "SETTINGS") return "bg-[#f0fdfa]";
  if (m === "USERS") return "bg-[#f0f9ff]";
  return "bg-gray-50";
};

const getModuleColor = (module: string) => {
  const m = module.toUpperCase();
  if (m === "ASSETS") return "text-[#2563eb] bg-[#eff6ff]";
  if (m === "AUDIT_LOGS") return "text-[#16a34a] bg-[#f0fdf4]";
  if (m === "AUDITS") return "text-[#9333ea] bg-[#faf5ff]";
  if (m === "MAINTENANCE") return "text-[#ea580c] bg-[#fff7ed]";
  if (m === "MASTERS") return "text-[#0891b2] bg-[#ecfeff]";
  if (m === "MOVEMENTS") return "text-[#d97706] bg-[#fffbeb]";
  if (m === "REPORTS") return "text-[#4f46e5] bg-[#eef2ff]";
  if (m === "ROLES") return "text-[#e11d48] bg-[#fff1f2]";
  if (m === "SETTINGS") return "text-[#0d9488] bg-[#f0fdfa]";
  if (m === "USERS") return "text-[#0ea5e9] bg-[#f0f9ff]";
  return "text-gray-600 bg-gray-100";
};

const getModuleDescription = (module: string) => {
  const m = module.toUpperCase();
  if (m === "ASSETS") return "Manage organizational assets";
  if (m === "AUDIT_LOGS") return "View and export audit logs";
  if (m === "AUDITS") return "Manage audit activities and results";
  if (m === "MAINTENANCE") return "Create and manage maintenance requests";
  if (m === "MASTERS") return "Manage master data and configurations";
  if (m === "MOVEMENTS") return "Manage asset transfers and allocations";
  if (m === "REPORTS") return "Generate and export system reports";
  if (m === "ROLES") return "Configure system roles and permissions";
  if (m === "SETTINGS") return "Manage global system configurations";
  if (m === "USERS") return "Manage user accounts and access";
  return "Configure module permissions";
};

const groupPermissions = (perms: any[]) => {
  const groups: Record<string, any[]> = {
    "BASIC ACCESS": [],
    "DATA MANAGEMENT": [],
    "ASSET LIFECYCLE": [],
    "ADVANCED": [],
    "OTHER": [],
  };

  perms.forEach(p => {
    const action = (p.action || "").toUpperCase();
    if (["VIEW", "CREATE", "EDIT", "DELETE"].includes(action)) {
      groups["BASIC ACCESS"].push(p);
    } else if (["IMPORT", "EXPORT"].includes(action)) {
      groups["DATA MANAGEMENT"].push(p);
    } else if (["ASSIGN", "TRANSFER", "DAMAGE", "DISPOSE"].includes(action)) {
      groups["ASSET LIFECYCLE"].push(p);
    } else if (["APPROVE", "ARCHIVE", "COMPLETE", "EXECUTE"].includes(action)) {
      groups["ADVANCED"].push(p);
    } else {
      groups["OTHER"].push(p);
    }
  });

  // Remove empty groups
  Object.keys(groups).forEach(key => {
    if (groups[key].length === 0) delete groups[key];
  });

  return groups;
};

const capitalize = (str: string) => {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
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
        fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/permissions`).then(r => r.json()),
        isEdit ? fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/roles/${role.id}`).then(r => r.json()) : Promise.resolve(null)
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
      <DialogContent className="sm:max-w-[950px] p-0 overflow-hidden bg-[#fafafa]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-white border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#eff6ff] rounded-2xl flex items-center justify-center shrink-0 shadow-sm text-[#2563eb]">
              <Shield className="w-6 h-6 fill-current" />
            </div>
            <div>
              <h2 className="text-[24px] font-bold text-gray-900 leading-none mb-1">{isEdit ? "Edit Role" : "Add Role"}</h2>
              <p className="text-[14px] text-gray-500">Create a new role and configure its permissions</p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="p-6 md:p-8 space-y-8 max-h-[75vh] overflow-y-auto">
              {/* Top Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="font-semibold text-[14px] text-gray-800 block mb-2">Role Name <span className="text-red-500">*</span></FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <div className="w-[42px] h-[42px] bg-gray-50 border border-gray-200 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                            <User className="w-5 h-5" />
                          </div>
                          <Input placeholder="Enter role name" className="flex-1 h-[42px] rounded-lg border-input bg-white" {...field} />
                        </div>
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
                        <div className="flex items-center gap-3">
                          <div className="w-[42px] h-[42px] bg-gray-50 border border-gray-200 text-gray-400 rounded-lg flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                          <Input placeholder="Enter role description (optional)" className="flex-1 h-[42px] rounded-lg border-input bg-white" {...field} value={field.value || ""} />
                        </div>
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
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="text-[18px] font-bold text-gray-900 leading-none mb-1.5">Permissions</h3>
                    <p className="text-[14px] text-gray-500">Configure permissions for each module.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button type="button" onClick={handleSelectAll} className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-[#2563eb] bg-[#eff6ff] border border-[#bfdbfe] hover:bg-[#dbeafe] rounded-lg transition-colors">
                      <CheckSquare className="w-4 h-4" />
                      Select All
                    </button>
                    <button type="button" onClick={handleClearAll} className="flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold text-[#ef4444] bg-[#fef2f2] border border-[#fecaca] hover:bg-[#fee2e2] rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                      Clear All
                    </button>
                  </div>
                </div>

                <div className="space-y-3 pt-2">
                  <FormField
                    control={form.control}
                    name="permissionIds"
                    render={({ field }) => (
                      <>
                        {Object.entries(permissionsMap).map(([module, perms]: any) => {
                          const safePerms = Array.isArray(perms) ? perms : [];
                          const isExpanded = expandedModules[module];
                          const selectedCount = safePerms.filter(p => field.value?.includes(p.id)).length;
                          const totalCount = safePerms.length;
                          const groupedPerms = groupPermissions(safePerms);

                          return (
                            <div key={module} className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm transition-all">
                              {/* Header (Accordion Toggle) */}
                              <div 
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50/50 transition-colors"
                                onClick={() => toggleModule(module)}
                              >
                                <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getModuleBg(module)}`}>
                                    {getModuleIcon(module)}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-[15px] text-gray-900 uppercase tracking-wide">{module}</h4>
                                    <p className="text-[13px] text-gray-500 mt-0.5">{getModuleDescription(module)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className={`px-3 py-1 rounded-full text-[12px] font-bold ${getModuleColor(module)}`}>
                                    {selectedCount} / {totalCount} selected
                                  </div>
                                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                                </div>
                              </div>
                              
                              {/* Content */}
                              {isExpanded && (
                                <div className="p-6 pt-2 border-t border-gray-100 bg-white">
                                  <div className="flex flex-col space-y-8 mt-2">
                                    {Object.entries(groupedPerms).map(([groupName, groupPerms]) => (
                                      <div key={groupName} className="w-full">
                                        <h5 className="text-[12px] font-bold text-gray-500 uppercase tracking-wider mb-4 border-b pb-2">{groupName}</h5>
                                        <div className="flex flex-wrap gap-x-10 gap-y-4">
                                          {groupPerms.map((p: any) => (
                                            <div key={p.id} className="flex items-center space-x-3 w-[140px]">
                                              <Checkbox
                                                id={`perm-${p.id}`}
                                                checked={field.value?.includes(p.id)}
                                                onCheckedChange={(checked) => {
                                                  if (checked) field.onChange([...(field.value || []), p.id]);
                                                  else field.onChange((field.value || []).filter((id: string) => id !== p.id));
                                                }}
                                                className="data-[state=checked]:bg-[#2563eb] data-[state=checked]:border-[#2563eb] rounded-[4px] w-5 h-5"
                                              />
                                              <label htmlFor={`perm-${p.id}`} className="text-[14px] text-gray-800 cursor-pointer font-medium select-none">
                                                {capitalize(p.action)}
                                              </label>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  
                                  <div className="mt-8 bg-[#f8fafc] border border-blue-100 rounded-lg p-3 flex items-center gap-2">
                                    <Info className="w-4 h-4 text-blue-500" />
                                    <p className="text-[13px] text-gray-600">{selectedCount} of {totalCount} permissions selected for this module</p>
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="px-6 h-[44px] rounded-lg font-semibold text-[14px] text-gray-700 border-gray-200 flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </Button>
              <Button type="submit" disabled={loading} className="bg-[#2563eb] hover:bg-blue-700 text-white px-6 h-[44px] rounded-lg font-semibold text-[14px]">
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
