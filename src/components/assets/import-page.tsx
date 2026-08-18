"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Upload, AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

export function ImportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [autoCreate, setAutoCreate] = useState(false);
  
  const [isImportComplete, setIsImportComplete] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const [imageUploadResult, setImageUploadResult] = useState<{ successCount: number; failedCount: number; errors: string[] } | null>(null);
  const [importResult, setImportResult] = useState<{ successfulRecords: number; failedRecords: number } | null>(null);
  
  const [previewData, setPreviewData] = useState<{
    rows: any[];
    summary: { total: number; new: number; update: number; error: number };
  } | null>(null);

  const handleDownloadTemplate = () => {
    window.open("/api/assets/import/template", "_blank");
  };

  const handlePreview = async (overrideAutoCreate?: boolean) => {
    if (!file) return;
    setIsPreviewing(true);
    setPreviewData(null);
    const currentAutoCreate = typeof overrideAutoCreate === "boolean" ? overrideAutoCreate : autoCreate;
    
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("autoCreate", String(currentAutoCreate));
      
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/import/preview`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Preview failed");
      }
      
      const data = await res.json();
      setPreviewData(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to generate preview");
    } finally {
      setIsPreviewing(false);
    }
  };

  const handleConfirm = async () => {
    if (!previewData || previewData.rows.length === 0) return;
    setIsImporting(true);
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/import/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: file?.name,
          rows: previewData.rows,
          autoCreate
        }),
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Import failed");
      }
      
      const result = await res.json();
      setImportResult(result);
      toast.success(`Import complete. ${result.successfulRecords} succeeded, ${result.failedRecords} failed.`);
      setIsImportComplete(true);
    } catch (error: any) {
      toast.error(error.message || "An error occurred during import");
    } finally {
      setIsImporting(false);
    }
  };

  const handleImageUpload = async () => {
    if (imageFiles.length === 0) return;
    setIsUploadingImages(true);
    setImageUploadResult(null);

    try {
      const formData = new FormData();
      imageFiles.forEach(file => formData.append("images", file));

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets/import/images`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Image upload failed");
      }

      const result = await res.json();
      setImageUploadResult(result);
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error.message || "An error occurred during image upload");
    } finally {
      setIsUploadingImages(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Bulk Import Assets</h2>
          <p className="text-muted-foreground mt-1">Upload multiple assets via Excel. Download the template first to ensure correct formatting.</p>
        </div>
        <Button variant="outline" onClick={handleDownloadTemplate}>
          <Download className="mr-2 h-4 w-4" /> Download Template
        </Button>
      </div>

      {!isImportComplete && (
        <Card>
          <CardHeader>
            <CardTitle>1. Upload Excel File</CardTitle>
            <CardDescription>Only .xlsx files are supported</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <input 
                type="file" 
                accept=".xlsx" 
                className="block w-full max-w-sm text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setPreviewData(null);
                }} 
              />
              <Button onClick={() => handlePreview()} disabled={!file || isPreviewing}>
                {isPreviewing ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                Generate Preview
              </Button>
            </div>
            
          </CardContent>
        </Card>
      )}

      {!isImportComplete && previewData && (
        <Card>
          <CardHeader>
            <CardTitle>2. Preview & Validation</CardTitle>
            <div className="flex space-x-4 mt-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Total: {previewData.summary.total}</Badge>
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">New: {previewData.summary.new}</Badge>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Update: {previewData.summary.update}</Badge>
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Errors: {previewData.summary.error}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-md max-h-[500px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Row</TableHead>
                    <TableHead className="w-24">Action</TableHead>
                    <TableHead>Asset Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Error Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.rows.map((row, idx) => (
                    <TableRow key={idx} className={row._action === "ERROR" ? "bg-red-50/50" : row._action === "UPDATE" ? "bg-yellow-50/50" : ""}>
                      <TableCell>{row._rowNumber}</TableCell>
                      <TableCell>
                        {row._action === "NEW" && <Badge className="bg-green-600 hover:bg-green-700">New</Badge>}
                        {row._action === "UPDATE" && <Badge className="bg-yellow-600 hover:bg-yellow-700">Update</Badge>}
                        {row._action === "ERROR" && <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" /> Error</Badge>}
                      </TableCell>
                      <TableCell className="font-medium">{row.assetCode}</TableCell>
                      <TableCell>{row.name}</TableCell>
                      <TableCell>{row.category}</TableCell>
                      <TableCell>{row.company}</TableCell>
                      <TableCell>{row.status}</TableCell>
                      <TableCell className="max-w-sm">
                        {row._errors && row._errors.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-red-600 space-y-1 mb-1">
                            {row._errors.map((err: string, i: number) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        )}
                        {row._warnings && row._warnings.length > 0 && (
                          <ul className="list-disc list-inside text-xs text-amber-600 space-y-1">
                            {row._warnings.map((warn: string, i: number) => (
                              <li key={i}>{warn}</li>
                            ))}
                          </ul>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {previewData.rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground h-24">No valid rows found in Excel sheet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-col items-end gap-4 mt-4">
              <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Checkbox 
                  id="autoCreate" 
                  checked={autoCreate} 
                  onCheckedChange={(checked) => {
                    setAutoCreate(checked as boolean);
                    if (previewData) {
                      handlePreview(checked as boolean);
                    }
                  }} 
                />
                <Label htmlFor="autoCreate" className="text-sm font-medium text-blue-900 cursor-pointer">
                  Automatically create missing master data (Categories, Companies, Locations, etc.)
                </Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => handlePreview()}
                  disabled={isPreviewing || isImporting}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isPreviewing ? "animate-spin" : ""}`} />
                  Refresh Preview
                </Button>
                <Button 
                  size="lg" 
                  onClick={handleConfirm} 
                  disabled={isImporting || previewData.summary.new + previewData.summary.update === 0}
                >
                  {isImporting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                  Confirm Import ({previewData.summary.new + previewData.summary.update} records)
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isImportComplete && (
        <Card>
          <CardHeader>
            <CardTitle>2. Import Complete</CardTitle>
            <CardDescription>
              Your excel file has been processed. You can now optionally attach images to the imported assets.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {importResult && (
              <div className={`p-4 rounded-lg ${importResult.failedRecords > 0 ? "bg-amber-50 border border-amber-200" : "bg-green-50 border border-green-200"}`}>
                <h4 className="font-semibold mb-1 text-slate-800">Excel Import Results</h4>
                <p className="text-sm text-slate-600">Successfully created/updated: <strong className="text-green-700">{importResult.successfulRecords}</strong> assets</p>
                {importResult.failedRecords > 0 && (
                  <p className="text-sm text-red-600 mt-1">Failed to process: <strong>{importResult.failedRecords}</strong> records. Please check the import logs.</p>
                )}
              </div>
            )}
            
            <div>
              <h4 className="font-semibold text-slate-800 mb-2">Upload Asset Images (Optional)</h4>
              <p className="text-sm text-slate-600 mb-4">
                Select multiple images to attach to the newly imported assets. 
                The image files must be named exactly as the Asset Code (e.g., AST-001.jpg).
              </p>
              <div className="flex flex-col gap-4 max-w-xl">
              <input 
                type="file" 
                accept="image/*" 
                multiple
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                onChange={(e) => {
                  setImageFiles(Array.from(e.target.files || []));
                  setImageUploadResult(null);
                }} 
              />
              <div className="flex gap-4 mt-2">
                <Button 
                  onClick={handleImageUpload} 
                  disabled={imageFiles.length === 0 || isUploadingImages}
                  className="w-48"
                >
                  {isUploadingImages ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                  Upload {imageFiles.length > 0 ? `${imageFiles.length} Images` : "Images"}
                </Button>
                <Button variant="outline" onClick={() => router.push("/assets")}>
                  Skip & Go to Assets
                </Button>
              </div>
            </div>

            {imageUploadResult && (
              <div className={`p-4 rounded-lg mt-4 ${imageUploadResult.failedCount > 0 ? "bg-amber-50" : "bg-green-50"}`}>
                <h4 className="font-semibold mb-2">Upload Results</h4>
                <p className="text-sm">Successfully attached: <strong>{imageUploadResult.successCount}</strong></p>
                <p className="text-sm text-red-600 mb-2">Failed: <strong>{imageUploadResult.failedCount}</strong></p>
                {imageUploadResult.errors.length > 0 && (
                  <ul className="list-disc list-inside text-xs text-red-600 space-y-1">
                    {imageUploadResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                  </ul>
                )}
                {imageUploadResult.failedCount === 0 && (
                  <Button className="mt-4" onClick={() => router.push("/assets")}>Continue to Assets</Button>
                )}
              </div>
            )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
