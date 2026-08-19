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
import { Loader2, X, FileText, Upload } from "lucide-react";

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
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? "Edit Asset" : "Register New Asset"}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormItem>
                  <FormLabel>Asset Image (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      type="file" 
                      accept="image/*" 
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
                    />
                  </FormControl>
                  <p className="text-[0.8rem] text-muted-foreground">Upload a photo to display on the asset details page.</p>
                </FormItem>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">Classification</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">Location & Assignment</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                      <FormControl><Input placeholder="John Doe" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">Status & Condition</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="bg-slate-50 p-4 rounded-lg space-y-4">
              <h3 className="font-semibold text-lg text-slate-800">Purchase & Vendor Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 p-4 rounded-lg space-y-4 border">
                <FormField
                  control={form.control}
                  name="warrantyApplicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-bold">Warranty Applicable</FormLabel>
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
              </div>

              <div className="bg-slate-50 p-4 rounded-lg space-y-4 border">
                <FormField
                  control={form.control}
                  name="amcApplicable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 bg-white shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base font-bold">AMC Applicable</FormLabel>
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
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Description & Notes</FormLabel>
                  <FormControl>
                    <Textarea className="h-24" placeholder="Any other details about the asset..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="bg-slate-50 p-4 rounded-lg space-y-4 border">
              <div className="space-y-0.5">
                <FormLabel className="text-base font-bold">Attach Documents</FormLabel>
                <p className="text-sm text-muted-foreground">Upload invoices, manuals, or certificates. They will be saved when you submit the form.</p>
              </div>
              <div className="flex items-end gap-4 bg-white p-4 border rounded-md shadow-sm">
                <div className="space-y-2 flex-1">
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
                <ul className="space-y-2 pt-2">
                  {pendingDocs.map((doc) => (
                    <li key={doc.id} className="flex justify-between items-center border p-3 rounded-lg bg-white">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.file.name}</p>
                          <p className="text-xs text-muted-foreground">{doc.type} • {(doc.file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" type="button" onClick={() => setPendingDocs(pendingDocs.filter(d => d.id !== doc.id))}>
                        <X className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-end border-t pt-6">
              <Button type="button" variant="outline" className="mr-4" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting} className="w-40">
                {isSubmitting ? "Saving..." : (initialData ? "Save Changes" : "Register Asset")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
