"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, Check, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface AuditScannerProps {
  auditId: string;
}

export function AuditScanner({ auditId }: AuditScannerProps) {
  const [assetCode, setAssetCode] = useState("");
  const [scanning, setScanning] = useState(false);
  const [classification, setClassification] = useState("VERIFIED");
  const [newStatusId, setNewStatusId] = useState("none");
  const [newConditionId, setNewConditionId] = useState("none");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [recentScans, setRecentScans] = useState<any[]>([]);

  const { data: statuses = [] } = useQuery({
    queryKey: ["statuses"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/statuses`);
      const data = await res.json();
      return data.data || [];
    },
  });

  const { data: conditions = [] } = useQuery({
    queryKey: ["conditions"],
    queryFn: async () => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/masters/conditions`);
      const data = await res.json();
      return data.data || [];
    },
  });

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;
    
    if (scanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        false
      );

      scanner.render(
        (decodedText) => {
          setAssetCode(decodedText);
          setScanning(false);
          scanner?.clear();
          toast.success("QR Code Scanned successfully!");
        },
        (err) => {
          // Ignore frequent scanning errors
        }
      );
    }

    return () => {
      if (scanner) scanner.clear();
    };
  }, [scanning]);

  const handleSubmit = async () => {
    if (!assetCode) {
      toast.error("Asset code is required");
      return;
    }

    setSubmitting(true);
    try {
      const payload: any = {
        assetCode,
        classification,
        remarks,
        newStatusId: newStatusId !== "none" ? newStatusId : undefined,
        newConditionId: newConditionId !== "none" ? newConditionId : undefined,
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/audits/${auditId}/scan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to record scan");

      toast.success("Asset recorded successfully");
      
      setRecentScans(prev => [{ assetCode, classification, time: new Date() }, ...prev].slice(0, 5));
      setAssetCode("");
      setRemarks("");
      setClassification("VERIFIED");
      setNewStatusId("none");
      setNewConditionId("none");
      
    } catch (error) {
      toast.error("Error recording asset scan");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Scan QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scanning ? (
            <div id="reader" className="w-full rounded-md border overflow-hidden"></div>
          ) : (
            <Button 
              className="w-full h-32 flex flex-col gap-2 bg-[#1B2A4A] hover:bg-[#1B2A4A]/90 text-white" 
              onClick={() => setScanning(true)}
            >
              <Camera className="w-8 h-8" />
              <span>Start Camera Scanner</span>
            </Button>
          )}

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or manual entry</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Asset Code</Label>
            <Input 
              placeholder="Enter asset code manually" 
              value={assetCode} 
              onChange={(e) => setAssetCode(e.target.value)} 
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Record Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Classification</Label>
            <Select value={classification} onValueChange={setClassification}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VERIFIED">Verified (Correct Location)</SelectItem>
                <SelectItem value="WRONG_LOCATION">Wrong Location</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Proposed Status (Leave 'No Change' if fine)</Label>
            <Select value={newStatusId} onValueChange={setNewStatusId}>
              <SelectTrigger>
                <SelectValue placeholder="No Change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Change</SelectItem>
                {statuses.map((s: any) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Proposed Condition (Leave 'No Change' if fine)</Label>
            <Select value={newConditionId} onValueChange={setNewConditionId}>
              <SelectTrigger>
                <SelectValue placeholder="No Change" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Change</SelectItem>
                {conditions.map((c: any) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Remarks (Optional)</Label>
            <Input 
              placeholder="Add any notes..." 
              value={remarks} 
              onChange={(e) => setRemarks(e.target.value)} 
            />
          </div>

          <Button 
            className="w-full bg-[#C5A55A] hover:bg-[#C5A55A]/90 text-white" 
            onClick={handleSubmit} 
            disabled={submitting || !assetCode}
          >
            Submit Scan
          </Button>
        </CardContent>
      </Card>
      
      {recentScans.length > 0 && (
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Scans</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recentScans.map((scan, i) => (
                <li key={i} className="flex justify-between items-center p-2 bg-slate-50 rounded border">
                  <div>
                    <span className="font-medium">{scan.assetCode}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {scan.time.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {scan.classification === "VERIFIED" ? 
                      <span className="text-green-600 flex items-center text-sm font-medium"><Check className="w-4 h-4 mr-1" /> Verified</span> :
                      <span className="text-red-600 flex items-center text-sm font-medium"><X className="w-4 h-4 mr-1" /> {scan.classification}</span>
                    }
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
