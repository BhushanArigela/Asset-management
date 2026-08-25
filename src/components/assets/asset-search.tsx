"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Tag, Box, Loader2, Info, Eye, QrCode, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { Filter } from "lucide-react";
import { toast } from "sonner";
import QRCode from "qrcode";

interface AssetSearchProps {
  initialQuery?: string;
}

export function AssetSearch({ initialQuery = "" }: AssetSearchProps) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(initialQuery);
  const [debouncedSearch, setDebouncedSearch] = useState(initialQuery);
  
  // Filters state
  const [categoryId, setCategoryId] = useState("");
  const [roomId, setRoomId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [statusId, setStatusId] = useState("");

  // Master data state
  const [categories, setCategories] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const printIframeRef = useRef<HTMLIFrameElement>(null);

  const handleBulkPrint = async (assetsToPrint: any[]) => {
    if (!assetsToPrint || assetsToPrint.length === 0) {
      toast.error("No assets to print");
      return;
    }

    setIsPrinting(true);
    const iframe = printIframeRef.current;
    if (!iframe) {
      setIsPrinting(false);
      return;
    }

    try {
      let html = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bulk Print QR - Search Results</title>
            <style>
              body { font-family: sans-serif; margin: 0; padding: 20px; display: flex; flex-wrap: wrap; gap: 20px; justify-content: center; }
              .qr-container { display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1px dashed #ccc; padding: 15px; border-radius: 8px; width: 250px; text-align: center; page-break-inside: avoid; margin-bottom: 20px; }
              img { max-width: 200px; max-height: 200px; margin-bottom: 10px; }
              h3 { margin: 0 0 5px 0; font-size: 16px; word-break: break-word; }
              p { margin: 0; font-size: 14px; color: #555; }
            </style>
          </head>
          <body>
      `;

      for (const a of assetsToPrint) {
        let qrDataUrl = a.qrCode;
        if (!qrDataUrl) {
          const appUrl = typeof window !== 'undefined' ? window.location.origin : "http://localhost:3000";
          const assetUrl = `${appUrl}/assets/${a.assetCode}`;
          qrDataUrl = await QRCode.toDataURL(assetUrl);
        }

        html += `
          <div class="qr-container">
            <img src="${qrDataUrl}" alt="${a.assetCode}" />
            <h3>${a.assetCode}</h3>
            <p>${a.name}</p>
          </div>
        `;
      }

      html += `
          </body>
        </html>
      `;

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();

        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setIsPrinting(false);
        }, 500);
      } else {
        setIsPrinting(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate QR codes");
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    let html5QrCode: Html5Qrcode | null = null;
    let timeout: NodeJS.Timeout;
    let isMounted = true;
    
    if (isScanning) {
      timeout = setTimeout(() => {
        try {
          if (!isMounted) return;
          html5QrCode = new Html5Qrcode("search-qr-reader");
          
          html5QrCode.start(
            { facingMode: "environment" }, // prefer back camera
            { fps: 10, qrbox: { width: 250, height: 250 } },
            (decodedText) => {
              let val = decodedText;
              if (val.includes('/assets/')) {
                val = val.split('/assets/').pop() || val;
              } else if (val.includes('roomCode=')) {
                val = val.split('roomCode=')[1].split('&')[0] || val;
              }
              setSearchTerm(val);
              setIsScanning(false);
            },
            (errorMessage) => {
              // ignore background scan errors
            }
          ).catch((err) => {
            console.error("Camera start failed", err);
            // If starting the camera fails (e.g. permissions denied), we keep the dialog open
            // but it will be empty. You could add a toast.error here if needed.
          });
        } catch (e) {
          console.error("Scanner init failed", e);
        }
      }, 150);
    }

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(() => {}).then(() => {
          html5QrCode?.clear();
        });
      }
    };
  }, [isScanning]);

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/categories`).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/rooms`).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/departments`).then(res => res.json()),
      fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/statuses`).then(res => res.json()),
    ]).then(([cats, rms, depts, stats]) => {
      setCategories(cats.data || []);
      setRooms(rms.data || []);
      setDepartments(depts.data || []);
      setStatuses(stats.data || []);
    });
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["assetsSearch", debouncedSearch, categoryId, roomId, departmentId, statusId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (categoryId && categoryId !== "none") params.append("categoryId", categoryId);
      if (roomId && roomId !== "none") params.append("roomId", roomId);
      if (departmentId && departmentId !== "none") params.append("departmentId", departmentId);
      if (statusId && statusId !== "none") params.append("statusId", statusId);
      params.append("limit", "50");

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/assets?${params.toString()}`);
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to fetch");
      }
      return res.json();
    },
    enabled: debouncedSearch.length > 0 || 
             (categoryId !== "" && categoryId !== "none") || 
             (roomId !== "" && roomId !== "none") || 
             (departmentId !== "" && departmentId !== "none") || 
             (statusId !== "" && statusId !== "none"),
  });

  const assets = data?.data || [];
  const isSearching = debouncedSearch.length > 0 || 
                      (categoryId !== "" && categoryId !== "none") || 
                      (roomId !== "" && roomId !== "none") || 
                      (departmentId !== "" && departmentId !== "none") || 
                      (statusId !== "" && statusId !== "none");

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className={`flex flex-col transition-all duration-300 ${isSearching ? "pb-4 space-y-3" : "items-center justify-center space-y-4 py-8"}`}>
        {!isSearching && (
          <>
            <h1 className="text-2xl font-bold tracking-tight">Search Assets</h1>
            <p className="text-muted-foreground text-center max-w-lg">
              Quickly find assets by their QR Code, Name, Model, or Serial Number.
            </p>
          </>
        )}
        
        <div className={`w-full relative shadow-sm group ${isSearching ? "max-w-full" : "max-w-2xl mt-4"}`}>
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            type="search" 
            placeholder="Scan QR or type keywords..." 
            className="w-full h-12 pl-12 pr-12 text-lg rounded-full bg-background border-2 focus-visible:ring-0 focus-visible:border-primary transition-all"
            value={searchTerm}
            onChange={(e) => {
              let val = e.target.value;
              if (val.includes('/assets/')) {
                try {
                  const url = new URL(val);
                  val = url.pathname.split('/').pop() || val;
                } catch (e) {
                  val = val.split('/assets/').pop() || val;
                }
              } else if (val.includes('roomCode=')) {
                try {
                  const url = new URL(val);
                  val = url.searchParams.get('roomCode') || val;
                } catch (e) {
                  val = val.split('roomCode=')[1].split('&')[0] || val;
                }
              }
              setSearchTerm(val);
            }}
            autoFocus
          />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-primary rounded-full hover:bg-muted"
            onClick={() => setIsScanning(true)}
            title="Scan QR Code"
          >
            <QrCode className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 px-1">
          {isSearching && (
            <div className="flex items-center justify-between w-full">
              <div className="text-sm text-muted-foreground font-medium">
                {assets.length} results found
              </div>
              <Button 
                onClick={() => handleBulkPrint(assets)} 
                disabled={isPrinting || assets.length === 0} 
                variant="outline" 
                size="sm"
                className="ml-auto"
              >
                {isPrinting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
                {isPrinting ? "Generating..." : "Bulk Print QRs"}
              </Button>
            </div>
          )}
        </div>

        {/* Filters Panel - always visible */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mt-2">
          <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-muted-foreground italic">All Categories</SelectItem>
                {categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={roomId} onValueChange={setRoomId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Room/Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-muted-foreground italic">All Rooms</SelectItem>
                {rooms.map(r => <SelectItem key={r.id} value={r.id}>{r.name} ({r.code})</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={departmentId} onValueChange={setDepartmentId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-muted-foreground italic">All Departments</SelectItem>
                {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={statusId} onValueChange={setStatusId}>
              <SelectTrigger className="bg-white">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none" className="text-muted-foreground italic">All Statuses</SelectItem>
                {statuses.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
      </div>

      {!isSearching ? (
        <div className="flex flex-col justify-center items-center py-20 text-muted-foreground">
          <Search className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">Ready to search</p>
          <p className="text-sm">Start typing a name, model, or scan a QR code</p>
        </div>
      ) : isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center text-destructive py-20">
          Failed to load assets: {(error as any)?.message}
        </div>
      ) : assets.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
          {assets.map((asset: any) => (
            <Card 
              key={asset.id} 
              className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all overflow-hidden group"
              onClick={() => router.push(`/assets/${asset.id}`)}
            >
              <CardContent className="p-0">
                {(asset.imageUrl || (asset.assetDocuments && asset.assetDocuments.length > 0)) ? (
                  <div className="w-full h-40 overflow-hidden relative border-b">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={asset.imageUrl ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${asset.imageUrl}` : (asset.assetDocuments?.[0]?.filePath ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${asset.assetDocuments[0].filePath}` : undefined)} 
                      alt={asset.name} 
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-40 overflow-hidden relative border-b bg-muted flex items-center justify-center">
                    <span className="text-muted-foreground text-sm font-medium">No Image</span>
                  </div>
                )}
                <div className="p-5 border-b bg-slate-50/50 group-hover:bg-primary/5 transition-colors relative">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="bg-white">{asset.assetCode}</Badge>
                    <Badge variant={asset.status?.name === 'Active' ? 'default' : 'secondary'}>
                      {asset.status?.name || 'Unknown'}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-lg line-clamp-1 pr-8" title={asset.name}>{asset.name}</h3>
                  <div className="flex justify-between items-end mt-1">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Tag className="mr-1 h-3 w-3" />
                      {asset.category?.name} {asset.brand?.name ? `• ${asset.brand.name}` : ''}
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground absolute bottom-4 right-4">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="p-5 space-y-3 bg-white">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="line-clamp-2 leading-tight">
                      <span className="font-medium text-foreground">{asset.building?.name || 'No Location'}</span>
                      <br/>
                      <span className="text-muted-foreground">{asset.room?.name || 'No Room'}, {asset.department?.name || 'No Dept'}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <Info className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="text-muted-foreground">
                      Condition: <span className="font-medium text-foreground">{asset.condition?.name || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col justify-center items-center py-20 text-muted-foreground">
          <Box className="h-16 w-16 mb-4 opacity-20" />
          <p className="text-lg font-medium">No assets found</p>
          <p className="text-sm">Try adjusting your search terms</p>
        </div>
      )}
      
      {isScanning && (
        <Dialog open={isScanning} onOpenChange={setIsScanning}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Scan Asset QR Code</DialogTitle>
            </DialogHeader>
            <div id="search-qr-reader" className="w-full"></div>
            <Button variant="outline" onClick={() => setIsScanning(false)} className="w-full mt-4">Cancel</Button>
          </DialogContent>
        </Dialog>
      )}

      <iframe ref={printIframeRef} style={{ display: "none" }} title="Print Frame" />
    </div>
  );
}
