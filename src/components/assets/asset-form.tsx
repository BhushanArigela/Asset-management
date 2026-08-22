"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, X, FileText, Upload, Tags, MapPin, ShieldCheck, ShoppingCart, AlignLeft, Paperclip, Calendar, Shield, Users } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  subCategoryId: z.string().optional(),
  brandId: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.coerce.number().optional(),
  vendorId: z.string().optional(),
  invoiceRef: z.string().optional(),
  commissioningDate: z.string().optional(),
  companyId: z.string().min(1, "Company is required"),
  buildingId: z.string().optional(),
  floorId: z.string().optional(),
  roomId: z.string().optional(),
  departmentId: z.string().optional(),
  responsiblePerson: z.string().optional(),
  statusId: z.string().min(1, "Status is required"),
  conditionId: z.string().min(1, "Condition is required"),
  warrantyApplicable: z.boolean().default(false),
  amcApplicable: z.boolean().default(false),
  notes: z.string().optional(),
  warranty: z.object({
    providerVendorId: z.string().optional(),
    startDate: z.string().optional(),
    expiryDate: z.string().optional(),
    reference: z.string().optional(),
    terms: z.string().optional(),
  }).optional().nullable(),
  amc: z.object({
    vendorId: z.string().optional(),
    startDate: z.string().optional(),
    expiryDate: z.string().optional(),
    contractRef: z.string().optional(),
    value: z.coerce.number().optional(),
    terms: z.string().optional(),
  }).optional().nullable(),
});

export function AssetForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  // Image and Document Upload State
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [pendingDocs, setPendingDocs] = useState<{id: string, file: File, type: string}[]>([]);
  const [docFile, setDocFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<string>("");

  // Master Data States
  const [categories, setCategories] = useState<any[]>([]);
  const [subCategories, setSubCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [conditions, setConditions] = useState<any[]>([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const fetchUrl = async (url: string) => {
          const r = await fetch(url);
          const d = await r.json();
          return d.data || [];
        };

        const [
          cat, subcat, br, ven, comp, bldg, flr, rm, dept, stat, cond
        ] = await Promise.all([
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/categories"),
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/sub-categories"),
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/brands"),
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/vendors"),
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/companies"),
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/buildings"),
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/floors"),
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/rooms"),
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/departments"),
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/statuses"),
          fetchUrl((process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/masters/conditions"),
        ]);

        setCategories(cat);
        setSubCategories(subcat);
        setBrands(br);
        setVendors(ven);
        setCompanies(comp);
        setBuildings(bldg);
        setFloors(flr);
        setRooms(rm);
        setDepartments(dept);
        setStatuses(stat);
        setConditions(cond);
      } catch (e) {
        toast.error("Failed to load master data");
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData ? {
      name: initialData.name || "",
      description: initialData.description || "",
      categoryId: initialData.categoryId || "",
      subCategoryId: initialData.subCategoryId || "",
      brandId: initialData.brandId || "",
      model: initialData.model || "",
      serialNumber: initialData.serialNumber || "",
      purchaseDate: initialData.purchaseDate || "",
      purchaseCost: initialData.purchaseCost || ("" as any),
      vendorId: initialData.vendorId || "",
      invoiceRef: initialData.invoiceRef || "",
      commissioningDate: initialData.commissioningDate || "",
      companyId: initialData.companyId || "",
      buildingId: initialData.buildingId || "",
      floorId: initialData.floorId || "",
      roomId: initialData.roomId || "",
      departmentId: initialData.departmentId || "",
      responsiblePerson: initialData.responsiblePerson || "",
      statusId: initialData.statusId || "",
      conditionId: initialData.conditionId || "",
      warrantyApplicable: !!initialData.warranty,
      amcApplicable: !!initialData.amc,
      notes: initialData.notes || "",
      warranty: initialData.warranty || {
        providerVendorId: "",
        startDate: "",
        expiryDate: "",
        reference: "",
        terms: "",
      },
      amc: initialData.amc || {
        vendorId: "",
        startDate: "",
        expiryDate: "",
        contractRef: "",
        value: "" as any,
        terms: "",
      }
    } : {
      name: "",
      description: "",
      categoryId: "",
      subCategoryId: "",
      brandId: "",
      model: "",
      serialNumber: "",
      purchaseDate: "",
      purchaseCost: "" as any,
      vendorId: "",
      invoiceRef: "",
      commissioningDate: "",
      companyId: "",
      buildingId: "",
      floorId: "",
      roomId: "",
      departmentId: "",
      responsiblePerson: "",
      statusId: "",
      conditionId: "",
      warrantyApplicable: false,
      amcApplicable: false,
      notes: "",
      warranty: {
        providerVendorId: "",
        startDate: "",
        expiryDate: "",
        reference: "",
        terms: "",
      },
      amc: {
        vendorId: "",
        startDate: "",
        expiryDate: "",
        contractRef: "",
        value: "" as any,
        terms: "",
      }
    },
  });

  const watchWarranty = form.watch("warrantyApplicable");
  const watchAmc = form.watch("amcApplicable");
  
  // Dependent filters
  const selectedCategoryId = form.watch("categoryId");
  const filteredSubCategories = subCategories.filter(s => s.categoryId === selectedCategoryId);
  
  const selectedCompanyId = form.watch("companyId");
  const filteredBuildings = buildings.filter(b => b.companyId === selectedCompanyId);
  
  const selectedBuildingId = form.watch("buildingId");
  const filteredFloors = floors.filter(f => f.buildingId === selectedBuildingId);
  
  const selectedFloorId = form.watch("floorId");
  const filteredRooms = rooms.filter(r => r.floorId === selectedFloorId);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const url = initialData ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${initialData.id}` : (process.env.NEXT_PUBLIC_BASE_PATH || "") + "/api/assets";
      const method = initialData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save asset");
      }

      const data = await res.json();
      const targetAssetId = initialData ? initialData.id : data.id;
      
      // Upload main image
      if (imageFile) {
        try {
          const imgData = new FormData();
          imgData.append("file", imageFile);
          await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${targetAssetId}/image`, {
            method: "POST",
            body: imgData,
          });
        } catch (e) {
          console.error("Failed to upload image", e);
        }
      }
      
      // Upload pending documents
      if (pendingDocs.length > 0) {
        for (const doc of pendingDocs) {
          try {
            const formData = new FormData();
            formData.append("file", doc.file);
            formData.append("documentType", doc.type);
            await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${targetAssetId}/documents`, {
              method: "POST",
              body: formData,
            });
          } catch (e) {
            console.error("Failed to upload document", doc.file.name, e);
          }
        }
      }

      toast.success(initialData ? `Asset updated successfully` : `Asset created successfully: ${data.assetCode}`);
      router.push(`/assets/${data.id}`);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadingData) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-[#1B2A4A] tracking-tight">
          {initialData ? "Edit Asset" : "Register New Asset"}
        </h1>
        <p className="text-[14px] text-gray-500 mt-1">
          {initialData ? "Update the asset details below" : "Add a new asset to your organization"}
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          
          <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 bg-gray-50/50 py-4 px-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-bold text-[#1B2A4A] !mt-0">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Asset Name *</FormLabel>
                      <FormControl><Input placeholder="e.g. MacBook Pro" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl><Input placeholder="e.g. M3 Pro" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="serialNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Serial Number</FormLabel>
                      <FormControl><Input placeholder="SN-12345" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div>
                <FormLabel className="mb-2 block">Asset Image (Optional)</FormLabel>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Box */}
                  <div className="border-2 border-dashed border-blue-200 rounded-xl bg-blue-50/30 flex flex-col items-center justify-center py-8 relative hover:bg-blue-50/50 transition-colors cursor-pointer group">
                    <input 
                      type="file" 
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept="image/*" 
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                    />
                    <Upload className="w-6 h-6 text-blue-500 mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-sm text-gray-600 mb-1">
                      <span className="text-blue-600 font-semibold">Click to upload</span> or drag & drop
                    </p>
                    <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wider">JPG, PNG up to 2MB</p>
                  </div>
                  {/* Preview Box */}
                  <div className="flex items-center gap-6">
                    <div className="w-[120px] h-[90px] rounded-lg border border-gray-100 bg-gray-50 flex flex-col items-center justify-center shrink-0 overflow-hidden relative shadow-sm">
                      {imageFile ? (
                        <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                      ) : initialData?.imageUrl ? (
                        <img src={`${process.env.NEXT_PUBLIC_BASE_PATH || ""}${initialData.imageUrl}`} alt="Asset Preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center text-gray-300">
                          <FileText className="w-6 h-6 mb-1 opacity-50" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">No Image</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-800 mb-1">Preview</h4>
                      <p className="text-xs text-gray-500 leading-relaxed max-w-[200px]">Image will appear in asset details page</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 bg-gray-50/50 py-4 px-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Tags className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-bold text-[#1B2A4A] !mt-0">Classification</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subCategoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sub-Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCategoryId}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Sub-Category" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {filteredSubCategories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Brand" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {brands.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 bg-gray-50/50 py-4 px-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-bold text-[#1B2A4A] !mt-0">Location & Assignment</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <FormField
                  control={form.control}
                  name="companyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Company" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="buildingId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Building</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedCompanyId}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Building" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {filteredBuildings.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="floorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedBuildingId}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Floor" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {filteredFloors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="roomId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value} disabled={!selectedFloorId}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Room" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {filteredRooms.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departmentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {departments.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="responsiblePerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Responsible Person</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Users className="w-4 h-4 text-blue-500 absolute left-3 top-3" />
                          <Input placeholder="John Doe" className="pl-9" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 bg-gray-50/50 py-4 px-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-bold text-[#1B2A4A] !mt-0">Status & Condition</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="statusId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {statuses.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="conditionId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Condition *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Condition" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {conditions.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 bg-gray-50/50 py-4 px-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <ShoppingCart className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-bold text-[#1B2A4A] !mt-0">Purchase & Vendor Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vendorId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Vendor</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {vendors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="invoiceRef"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Reference</FormLabel>
                      <FormControl><Input placeholder="INV-001" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="purchaseCost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Purchase Cost</FormLabel>
                      <FormControl><Input type="number" step="0.01" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="commissioningDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commissioning Date</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden border">
              <CardContent className="p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="warrantyApplicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Shield className="w-4 h-4 text-blue-600" />
                        </div>
                        <FormLabel className="text-sm font-bold text-[#1B2A4A] cursor-pointer m-0">Warranty Applicable</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                {watchWarranty && (
                  <div className="space-y-4 pt-2">
                    <FormField control={form.control} name="warranty.providerVendorId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Warranty Provider *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {vendors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="warranty.startDate" render={({ field }) => (
                        <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="warranty.expiryDate" render={({ field }) => (
                        <FormItem><FormLabel>Expiry Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="warranty.reference" render={({ field }) => (
                      <FormItem><FormLabel>Reference Number</FormLabel><FormControl><Input placeholder="WARR-123" {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={form.control} name="warranty.terms" render={({ field }) => (
                      <FormItem><FormLabel>Terms</FormLabel><FormControl><Textarea placeholder="Warranty terms..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden border">
              <CardContent className="p-4 space-y-4">
                <FormField
                  control={form.control}
                  name="amcApplicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-blue-600" />
                        </div>
                        <FormLabel className="text-sm font-bold text-[#1B2A4A] cursor-pointer m-0">AMC Applicable</FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {watchAmc && (
                  <div className="space-y-4 pt-2">
                    <FormField control={form.control} name="amc.vendorId" render={({ field }) => (
                      <FormItem>
                        <FormLabel>AMC Vendor *</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select Vendor" /></SelectTrigger></FormControl>
                        <SelectContent>
                          {vendors.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="amc.startDate" render={({ field }) => (
                        <FormItem><FormLabel>Start Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="amc.expiryDate" render={({ field }) => (
                        <FormItem><FormLabel>Expiry Date *</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <FormField control={form.control} name="amc.contractRef" render={({ field }) => (
                        <FormItem><FormLabel>Contract Ref</FormLabel><FormControl><Input placeholder="AMC-123" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="amc.value" render={({ field }) => (
                        <FormItem><FormLabel>AMC Value</FormLabel><FormControl><Input type="number" step="0.01" {...field} /></FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="amc.terms" render={({ field }) => (
                      <FormItem><FormLabel>Terms</FormLabel><FormControl><Textarea placeholder="AMC terms..." {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 bg-gray-50/50 py-4 px-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
                <AlignLeft className="w-4 h-4 text-pink-500" />
              </div>
              <CardTitle className="text-base font-bold text-[#1B2A4A] !mt-0">Additional Description & Notes</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea className="min-h-[100px] border-gray-200 resize-y" placeholder="Any other details about the asset..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="rounded-xl border-gray-100 shadow-sm overflow-hidden">
            <CardHeader className="flex flex-row items-center gap-3 bg-gray-50/50 py-4 px-6 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Paperclip className="w-4 h-4 text-blue-600" />
              </div>
              <div className="space-y-1 !mt-0">
                <CardTitle className="text-base font-bold text-[#1B2A4A]">Attach Documents</CardTitle>
                <p className="text-xs text-gray-500">Upload invoices, manuals, or certificates. They will be saved when you submit the form.</p>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-end gap-4">
                <div className="space-y-2 flex-1 w-full">
                  <FormLabel>Document Type</FormLabel>
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asset photographs">Asset photographs</SelectItem>
                      <SelectItem value="Purchase invoice">Purchase invoice</SelectItem>
                      <SelectItem value="Warranty certificate">Warranty certificate</SelectItem>
                      <SelectItem value="AMC agreement">AMC agreement</SelectItem>
                      <SelectItem value="User manual">User manual</SelectItem>
                      <SelectItem value="Service documents">Service documents</SelectItem>
                      <SelectItem value="Other supporting documents">Other supporting documents</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 flex-1">
                  <FormLabel>File</FormLabel>
                  <Input type="file" onChange={(e) => setDocFile(e.target.files?.[0] || null)} id="file-upload-input" />
                </div>
                <Button 
                  type="button" 
                  variant="secondary"
                  disabled={!docFile || !docType}
                  onClick={() => {
                    if (docFile && docType) {
                      setPendingDocs([...pendingDocs, { id: Math.random().toString(), file: docFile, type: docType }]);
                      setDocFile(null);
                      setDocType("");
                      const fileInput = document.getElementById('file-upload-input') as HTMLInputElement;
                      if (fileInput) fileInput.value = '';
                    }
                  }}
                >
                  <Upload className="h-4 w-4 mr-2" /> Add File
                </Button>
              </div>
              
              {pendingDocs.length > 0 && (
                <ul className="space-y-2 mt-4">
                  {pendingDocs.map((doc) => (
                    <li key={doc.id} className="flex justify-between items-center border p-3 rounded-lg bg-gray-50/50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.file.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} • {(doc.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" type="button" onClick={() => setPendingDocs(pendingDocs.filter(d => d.id !== doc.id))}>
                        <X className="h-4 w-4 text-red-500" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end items-center gap-4 pt-4 pb-12">
            <Button type="button" variant="outline" className="bg-white border-gray-200 text-gray-700 hover:bg-gray-50 px-6 font-semibold" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#1d4ed8] hover:bg-blue-700 text-white px-8 font-semibold shadow-sm">
              {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Register Asset")}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
