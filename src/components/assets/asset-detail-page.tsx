"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ReportDamageDialog } from "@/components/assets/report-damage-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, ArrowRightLeft, Wrench, Trash2, QrCode, Upload, FileText, AlertTriangle, Shield, ShieldCheck, ShieldAlert, CalendarDays } from "lucide-react";
import { formatDateTime } from "@/lib/utils";
import { toast } from "sonner";
import { QrCodeModal } from "./qr-modal";
import { AssetAccessoriesTab } from "./asset-accessories-tab";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export function AssetDetailPage({ assetId }: { assetId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [damageOpen, setDamageOpen] = useState(false);
  
  // Disposal State
  const [disposeOpen, setDisposeOpen] = useState(false);
  const [isDisposing, setIsDisposing] = useState(false);
  const [disposeData, setDisposeData] = useState({
    disposalDate: new Date().toISOString().split("T")[0],
    reason: "",
    method: "Sale",
    value: "",
    approvalRef: "",
    remarks: ""
  });
  const [disposeFile, setDisposeFile] = useState<File | null>(null);

  const { data: asset, isLoading, refetch } = useQuery({
    queryKey: ["asset", assetId],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${assetId}`);
      if (!res.ok) throw new Error("Failed to fetch asset");
      return res.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (!asset) return <div>Asset not found.</div>;

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !documentType) return toast.error("Please select a file and document type");
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentType", documentType);
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${assetId}/documents`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Upload failed");
      
      toast.success("Document uploaded successfully");
      setUploadOpen(false);
      setFile(null);
      setDocumentType("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDispose = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDisposing(true);
    try {
      const payload = {
        ...disposeData,
        value: disposeData.value ? parseFloat(disposeData.value) : null,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${assetId}/dispose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to dispose asset");
      }

      if (disposeFile) {
        const formData = new FormData();
        formData.append("file", disposeFile);
        formData.append("documentType", "Disposal Document");
        await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/${assetId}/dispose/documents`, {
          method: "POST",
          body: formData,
        });
      }

      toast.success("Asset disposed successfully");
      setDisposeOpen(false);
      refetch();
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setIsDisposing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this asset? This will also remove its entire history (movements, audits, etc.) and cannot be undone.")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/assets/${asset.id}`, {
        method: "DELETE",
      });
      const resData = await res.json();
      
      if (res.ok) {
        toast.success("Asset deleted successfully");
        router.push("/assets");
      } else {
        toast.error(resData.error || "Failed to delete asset");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the asset");
    }
  };

  const canDeleteAsset = hasPermission(session?.user?.permissions, [PERMISSIONS.ASSETS_DELETE] as any);
  const canEditAsset = hasPermission(session?.user?.permissions, [PERMISSIONS.ASSETS_EDIT] as any);
  const canTransferAsset = hasPermission(session?.user?.permissions, [PERMISSIONS.MOVEMENTS_CREATE] as any);
  const canMaintainAsset = hasPermission(session?.user?.permissions, [PERMISSIONS.MAINTENANCE_CREATE] as any);
  const canDamageAsset = hasPermission(session?.user?.permissions, [PERMISSIONS.ASSETS_DAMAGE] as any);
  const canDisposeAsset = hasPermission(session?.user?.permissions, [PERMISSIONS.ASSETS_DISPOSE] as any);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full lg:w-auto">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{asset.name}</h2>
          {asset.isDisposed && <Badge variant="destructive" className="text-sm w-fit">Disposed</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {canDeleteAsset && (
            <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" onClick={handleDelete}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </Button>
          )}
          {!asset.isDisposed && (
            <>
              {canEditAsset && (
                <Button variant="outline" onClick={() => router.push(`/assets/${asset.id}/edit`)}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
                </Button>
              )}
              {canTransferAsset && (
                <Button variant="outline" onClick={() => router.push(`/movements/new?assetId=${asset.id}`)}>
                  <ArrowRightLeft className="mr-2 h-4 w-4" /> Transfer
                </Button>
              )}
              {canMaintainAsset && (
                <Button variant="outline" onClick={() => router.push(`/maintenance/new?assetId=${asset.id}`)}>
                  <Wrench className="mr-2 h-4 w-4" /> Maintenance
                </Button>
              )}
              <Button variant="outline" onClick={() => setQrModalOpen(true)}>
                <QrCode className="mr-2 h-4 w-4" /> Print QR
              </Button>
              {canDamageAsset && asset.status?.name !== "Damaged" && (
                <Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700" onClick={() => setDamageOpen(true)}>
                  <AlertTriangle className="mr-2 h-4 w-4" /> Report Damage
                </Button>
              )}
              {canDisposeAsset && (
                <Dialog open={disposeOpen} onOpenChange={setDisposeOpen}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Dispose
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Dispose Asset</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleDispose} className="space-y-4">
                      <div className="space-y-2">
                        <Label>Disposal Date *</Label>
                        <Input 
                          type="date" 
                          required
                          value={disposeData.disposalDate}
                          onChange={(e) => setDisposeData({...disposeData, disposalDate: e.target.value})}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Method *</Label>
                        <Select 
                          value={disposeData.method} 
                          onValueChange={(val) => setDisposeData({...disposeData, method: val})}
                        >
                          <SelectTrigger><SelectValue placeholder="Select method" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sale">Sale</SelectItem>
                            <SelectItem value="Recycle">Recycle</SelectItem>
                            <SelectItem value="Scrap">Scrap</SelectItem>
                            <SelectItem value="Donate">Donate</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Reason *</Label>
                        <Input 
                          required
                          value={disposeData.reason}
                          onChange={(e) => setDisposeData({...disposeData, reason: e.target.value})}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Value (Optional)</Label>
                          <Input 
                            type="number" 
                            step="0.01"
                            value={disposeData.value}
                            onChange={(e) => setDisposeData({...disposeData, value: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Approval Ref</Label>
                          <Input 
                            value={disposeData.approvalRef}
                            onChange={(e) => setDisposeData({...disposeData, approvalRef: e.target.value})}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Supporting Document</Label>
                        <Input type="file" onChange={(e) => setDisposeFile(e.target.files?.[0] || null)} />
                      </div>
                      <div className="flex justify-end pt-4 space-x-2">
                        <Button type="button" variant="outline" onClick={() => setDisposeOpen(false)}>Cancel</Button>
                        <Button type="submit" variant="destructive" disabled={isDisposing}>
                          {isDisposing ? "Processing..." : "Confirm Disposal"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4 w-full">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="w-full flex justify-start overflow-x-auto pb-2 -mb-2 no-scrollbar bg-white p-1 rounded-md border shadow-sm">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
            <TabsTrigger value="status-history">Status History</TabsTrigger>
            <TabsTrigger value="warranty">Warranty</TabsTrigger>
            <TabsTrigger value="amc">AMC</TabsTrigger>
            <TabsTrigger value="movements">Movement History</TabsTrigger>
            <TabsTrigger value="accessories">Accessories</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="overview" className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {asset.imageUrl && (
              <div className="w-full lg:w-1/3 flex-shrink-0">
                <div className="bg-white p-2 rounded-xl border shadow-sm flex items-center justify-center h-full min-h-[300px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={asset.imageUrl ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${asset.imageUrl}` : undefined} alt={asset.name} className="w-full max-h-[400px] object-contain rounded-lg" />
                </div>
              </div>
            )}
            <div className={`grid gap-4 md:grid-cols-2 w-full content-start ${!asset.imageUrl ? 'lg:grid-cols-3' : ''}`}>
              <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><span className="font-semibold">Code:</span> {asset.assetCode}</div>
                <div><span className="font-semibold">Serial:</span> {asset.serialNumber || "N/A"}</div>
                <div><span className="font-semibold">Category:</span> {asset.category?.name}</div>
                <div>
                  <span className="font-semibold">Status:</span> 
                  <Badge variant="outline" className="ml-2">{asset.status?.name}</Badge>
                </div>
                <div>
                  <span className="font-semibold">Condition:</span> 
                  <Badge variant="outline" className="ml-2">{asset.condition?.name}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><span className="font-semibold">Company:</span> {asset.company?.name}</div>
                <div><span className="font-semibold">Building:</span> {asset.building?.name}</div>
                <div><span className="font-semibold">Floor:</span> {asset.floor?.name}</div>
                <div><span className="font-semibold">Room:</span> {asset.room?.name || "N/A"}</div>
                <div><span className="font-semibold">Department:</span> {asset.department?.name || "N/A"}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Purchase Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div><span className="font-semibold">Purchase Date:</span> {asset.purchaseDate ? formatDateTime(asset.purchaseDate) : "N/A"}</div>
                <div><span className="font-semibold">Cost:</span> {asset.purchaseCost || "N/A"}</div>
                <div><span className="font-semibold">Vendor:</span> {asset.vendor?.name || "N/A"}</div>
                <div><span className="font-semibold">Invoice:</span> {asset.invoiceRef || "N/A"}</div>
              </CardContent>
            </Card>

            {asset.isDisposed && asset.assetDisposal && (
              <Card className="border-red-200 bg-red-50/30">
                <CardHeader>
                  <CardTitle className="text-red-700">Disposal Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div><span className="font-semibold">Disposal Date:</span> {formatDateTime(asset.assetDisposal.disposalDate)}</div>
                  <div><span className="font-semibold">Method:</span> {asset.assetDisposal.method}</div>
                  <div><span className="font-semibold">Reason:</span> {asset.assetDisposal.reason}</div>
                  <div><span className="font-semibold">Value:</span> {asset.assetDisposal.value || "N/A"}</div>
                  <div><span className="font-semibold">Ref:</span> {asset.assetDisposal.approvalRef || "N/A"}</div>
                  <div><span className="font-semibold">Disposed By:</span> {asset.assetDisposal.disposedBy?.name}</div>
                  {asset.assetDisposal.disposalDocuments && asset.assetDisposal.disposalDocuments.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-red-200">
                      <span className="font-semibold block mb-2">Supporting Documents:</span>
                      <ul className="space-y-2">
                        {asset.assetDisposal.disposalDocuments.map((doc: any) => (
                          <li key={doc.id} className="flex items-center text-sm">
                            <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                            <a href={doc.filePath ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${doc.filePath}` : "#"} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                              {doc.originalName}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Documents</CardTitle>
              <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
                <DialogTrigger asChild>
                  <Button size="sm"><Upload className="mr-2 h-4 w-4" /> Upload Document</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload Document</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleUpload} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Document Type</Label>
                      <Select value={documentType} onValueChange={setDocumentType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
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
                    <div className="space-y-2">
                      <Label>File</Label>
                      <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>
                    <Button type="submit" className="w-full" disabled={isUploading || !file || !documentType}>
                      {isUploading ? "Uploading..." : "Upload"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {asset.assetDocuments?.length ? (
                <ul className="space-y-2">
                  {asset.assetDocuments.map((doc: any) => (
                    <li key={doc.id} className="flex justify-between items-center border p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{doc.originalName}</p>
                          <p className="text-xs text-muted-foreground">{doc.documentType} • {(doc.fileSize / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <a href={doc.filePath ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${doc.filePath}` : "#"} target="_blank" className="text-sm font-medium text-primary hover:underline">View</a>
                    </li>
                  ))}
                </ul>
              ) : <p className="text-muted-foreground text-sm">No documents uploaded yet.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status-history">
          <Card>
            <CardHeader><CardTitle>Status History</CardTitle></CardHeader>
            <CardContent>
              {asset.assetStatusChanges?.length ? (
                <ul className="space-y-4 border-l-2 ml-4">
                  {asset.assetStatusChanges.map((m: any) => (
                    <li key={m.id} className="relative pl-6 pb-4 border-b last:border-0">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-2"></div>
                      <div className="font-semibold text-[#1B2A4A]">Changed on {formatDateTime(m.createdAt)} by {m.changedBy?.name || "System"}</div>
                      <div className="text-sm mt-1 flex items-center">
                        <Badge variant="outline" className="text-gray-500 line-through mr-2">{m.oldStatus?.name || "None"}</Badge>
                        <ArrowRightLeft className="w-3 h-3 text-gray-400 mr-2" />
                        <Badge>{m.newStatus?.name}</Badge>
                      </div>
                      {m.remarks && <div className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded-md italic">"{m.remarks}"</div>}
                    </li>
                  ))}
                </ul>
              ) : <p className="text-gray-500 italic text-sm">No status changes recorded.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warranty">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium tracking-tight">Warranties</h3>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Shield className="mr-1 h-3 w-3" /> {asset.assetWarranties?.length || 0} Records
              </Badge>
            </div>
            
            {asset.assetWarranties?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {asset.assetWarranties.map((w: any) => {
                  const isExpired = new Date(w.expiryDate) < new Date();
                  return (
                    <Card key={w.id} className={`overflow-hidden border-l-4 ${isExpired ? "border-l-red-500" : "border-l-green-500"}`}>
                      <CardHeader className="bg-muted/30 pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center">
                            {isExpired ? <ShieldAlert className="mr-2 h-4 w-4 text-red-500" /> : <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />}
                            {w.providerVendor?.name || "Unknown Provider"}
                          </CardTitle>
                          <Badge variant={isExpired ? "destructive" : "secondary"} className={!isExpired ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                            {isExpired ? "Expired" : "Active"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>
                            <span className="flex items-center mb-1"><CalendarDays className="mr-1 h-3 w-3" /> Start Date</span>
                            <span className="font-medium text-foreground">{formatDateTime(w.startDate).split(",")[0]}</span>
                          </div>
                          <div>
                            <span className="flex items-center mb-1"><CalendarDays className="mr-1 h-3 w-3" /> Expiry Date</span>
                            <span className="font-medium text-foreground">{formatDateTime(w.expiryDate).split(",")[0]}</span>
                          </div>
                        </div>
                        {w.reference && (
                          <div className="pt-2 border-t">
                            <span className="text-muted-foreground mr-2">Ref:</span>
                            <span className="font-medium">{w.reference}</span>
                          </div>
                        )}
                        {w.terms && (
                          <div className="pt-2 border-t text-muted-foreground">
                            {w.terms}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Shield className="h-8 w-8 mb-2 opacity-20" />
                  <p>No warranties recorded for this asset.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="amc">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium tracking-tight">AMC Contracts</h3>
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                <FileText className="mr-1 h-3 w-3" /> {asset.assetAmcs?.length || 0} Contracts
              </Badge>
            </div>
            
            {asset.assetAmcs?.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {asset.assetAmcs.map((a: any) => {
                  const isExpired = new Date(a.expiryDate) < new Date();
                  return (
                    <Card key={a.id} className={`overflow-hidden border-l-4 ${isExpired ? "border-l-red-500" : "border-l-indigo-500"}`}>
                      <CardHeader className="bg-muted/30 pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base flex items-center">
                            <FileText className={`mr-2 h-4 w-4 ${isExpired ? "text-red-500" : "text-indigo-500"}`} />
                            {a.vendor?.name || "Unknown Provider"}
                          </CardTitle>
                          <Badge variant={isExpired ? "destructive" : "secondary"} className={!isExpired ? "bg-indigo-100 text-indigo-800 hover:bg-indigo-100" : ""}>
                            {isExpired ? "Expired" : "Active"}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4 space-y-3 text-sm">
                        <div className="grid grid-cols-2 gap-2 text-muted-foreground">
                          <div>
                            <span className="flex items-center mb-1"><CalendarDays className="mr-1 h-3 w-3" /> Start Date</span>
                            <span className="font-medium text-foreground">{formatDateTime(a.startDate).split(",")[0]}</span>
                          </div>
                          <div>
                            <span className="flex items-center mb-1"><CalendarDays className="mr-1 h-3 w-3" /> Expiry Date</span>
                            <span className="font-medium text-foreground">{formatDateTime(a.expiryDate).split(",")[0]}</span>
                          </div>
                        </div>
                        <div className="pt-2 border-t flex justify-between">
                          {a.contractRef && (
                            <div>
                              <span className="text-muted-foreground mr-2">Ref:</span>
                              <span className="font-medium">{a.contractRef}</span>
                            </div>
                          )}
                          {a.value && (
                            <div>
                              <span className="text-muted-foreground mr-2">Value:</span>
                              <span className="font-medium">${a.value.toString()}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card>
                <CardContent className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <FileText className="h-8 w-8 mb-2 opacity-20" />
                  <p>No AMCs recorded for this asset.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="movements">
          <Card>
            <CardHeader><CardTitle>Movement History</CardTitle></CardHeader>
            <CardContent>
              {asset.assetMovements?.length ? (
                <ul className="space-y-4 border-l-2 ml-4">
                  {asset.assetMovements.map((m: any) => (
                    <li key={m.id} className="relative pl-6 pb-4 border-b">
                      <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-2"></div>
                      <div className="font-semibold">Moved on {formatDateTime(m.transferDate)}</div>
                      <div className="text-sm">From: {[m.fromBuilding?.name, m.fromFloor?.name, m.fromRoom?.name].filter(Boolean).join(" -> ") || "N/A"}</div>
                      <div className="text-sm">To: {[m.toBuilding?.name, m.toFloor?.name, m.toRoom?.name].filter(Boolean).join(" -> ") || "N/A"}</div>
                      <div className="text-sm text-gray-500">Reason: {m.reason}</div>
                    </li>
                  ))}
                </ul>
              ) : <p>No movements recorded.</p>}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessories">
          <AssetAccessoriesTab assetId={asset.id} accessories={asset.accessories || []} />
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardHeader><CardTitle>Maintenance Requests</CardTitle></CardHeader>
            <CardContent>
              {asset.maintenanceRequests?.length ? (
                <div className="space-y-6">
                  {asset.maintenanceRequests.map((mr: any) => (
                    <div key={mr.id} className="border rounded-lg overflow-hidden relative">
                      <div className="bg-slate-50 p-4 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                          <div className="font-semibold text-lg">{mr.requestNumber}</div>
                          <div className="text-sm text-slate-500 mt-1">{mr.description}</div>
                        </div>
                          <div className="text-left sm:text-right flex flex-row sm:flex-col items-center sm:items-end gap-3 sm:gap-0">
                          <div><Badge>{mr.status}</Badge></div>
                          <div className="text-xs text-slate-500 sm:mt-2">Priority: {mr.priority}</div>
                          {hasPermission(session?.user?.permissions, [PERMISSIONS.MAINTENANCE_EDIT] as any) && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2 sm:mt-2 h-7 text-xs hidden sm:flex"
                              onClick={() => router.push(`/maintenance/${mr.id}`)}
                            >
                              Update & Details
                            </Button>
                          )}
                        </div>
                        {hasPermission(session?.user?.permissions, [PERMISSIONS.MAINTENANCE_EDIT] as any) && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="sm:hidden absolute top-4 right-4 h-8"
                            onClick={() => router.push(`/maintenance/${mr.id}`)}
                          >
                            Update
                          </Button>
                        )}
                      </div>
                      <div className="p-4 bg-white">
                        <h4 className="text-sm font-semibold text-slate-700 mb-3">Updates History</h4>
                        {mr.updates && mr.updates.length > 0 ? (
                          <div className="space-y-3 pl-2 border-l-2 border-slate-100 ml-2">
                            {mr.updates.map((update: any) => (
                              <div key={update.id} className="relative pl-4">
                                <div className="absolute w-2 h-2 bg-slate-300 rounded-full -left-[5px] top-2"></div>
                                <div className="flex justify-between items-start mb-1">
                                  <div className="font-medium text-sm text-slate-700">{update.createdBy?.name || "System"}</div>
                                  <div className="text-xs text-slate-400">{formatDateTime(update.createdAt)}</div>
                                </div>
                                {update.statusChangedTo && (
                                  <div className="mb-1"><Badge variant="outline" className="text-[10px]">{update.statusChangedTo}</Badge></div>
                                )}
                                <div className="text-sm text-slate-600">{update.notes}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-slate-500 italic ml-2">No updates recorded yet.</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Wrench className="h-8 w-8 mb-2 opacity-20" />
                  <p>No maintenance requests recorded.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <QrCodeModal 
        isOpen={qrModalOpen} 
        onClose={() => setQrModalOpen(false)} 
        assetId={asset.id} 
      />
      <ReportDamageDialog
        assetId={asset.id}
        assetName={asset.name}
        open={damageOpen}
        onOpenChange={setDamageOpen}
        onSuccess={() => refetch()}
      />
    </div>
  );
}
