"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Play, CheckCircle, Lock, Camera, AlertTriangle, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export function AuditDetailPage({ auditId }: { auditId: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  
  const canExecuteAudit = hasPermission(session?.user?.permissions, [PERMISSIONS.AUDITS_EXECUTE] as any);
  const canCompleteAudit = hasPermission(session?.user?.permissions, [PERMISSIONS.AUDITS_COMPLETE] as any);

  const [audit, setAudit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAudit = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/audits/${auditId}`);
      if (!res.ok) throw new Error("Failed to load audit");
      const data = await res.json();
      setAudit(data);
    } catch (error) {
      toast.error("Failed to fetch audit data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAudit();
  }, [auditId]);

  const handleAction = async (action: "start" | "complete" | "lock") => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/audits/${auditId}/${action}`, { method: "POST" });
      if (!res.ok) throw new Error(`Failed to ${action} audit`);
      toast.success(`Audit ${action}ed successfully`);
      fetchAudit();
    } catch (error) {
      toast.error(`Error applying action: ${action}`);
      console.error(error);
    }
  };

  if (loading) return <div className="p-8">Loading audit details...</div>;
  if (!audit) return <div className="p-8">Audit not found</div>;

  const totalScannedExpected = audit.totalVerified + audit.totalDamaged;
  const progressPercent = audit.totalExpected > 0 ? (totalScannedExpected / audit.totalExpected) * 100 : 0;
  
  const discrepancies = audit.auditResults?.filter((r: any) => r.classification !== "VERIFIED") || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{audit.name}</h2>
          <div className="flex flex-wrap items-center gap-2 mt-2 text-muted-foreground text-sm">
            <Badge variant="outline" className={audit.status === "COMPLETED" ? "border-green-500 text-green-600" : audit.status === "IN_PROGRESS" ? "border-orange-500 text-orange-600" : "border-blue-500 text-blue-600"}>{audit.status}</Badge>
            <span>•</span>
            <span>{format(new Date(audit.auditDate), "PP")}</span>
            <span>•</span>
            <span>Auditor: {audit.auditor?.name || "Unknown"}</span>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {canExecuteAudit && audit.status === "PLANNED" && (
            <Button onClick={() => handleAction("start")} className="bg-blue-600">
              <Play className="w-4 h-4 mr-2" /> Start Audit
            </Button>
          )}
          {audit.status === "IN_PROGRESS" && (
            <>
              {canExecuteAudit && (
                <Button variant="outline" onClick={() => router.push(`/audits/${auditId}/scan`)}>
                  <Camera className="w-4 h-4 mr-2" /> Scan Asset
                </Button>
              )}
              {canCompleteAudit && (
                <Button onClick={() => handleAction("complete")} className="bg-green-600">
                  <CheckCircle className="w-4 h-4 mr-2" /> Complete
                </Button>
              )}
            </>
          )}
          {canCompleteAudit && audit.status === "COMPLETED" && (
            <Button onClick={() => handleAction("lock")} variant="secondary">
              <Lock className="w-4 h-4 mr-2" /> Lock Audit
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">{audit.totalVerified + audit.totalDamaged} / {audit.totalExpected} Scanned</div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Missing</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{audit.totalMissing}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Wrong Location</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-500">{audit.totalWrongLocation}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Damaged</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">{audit.totalDamaged}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Unexpected</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-purple-600">{audit.totalUnexpected}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="expected">
            <TabsList className="mb-4 h-auto flex-wrap">
              <TabsTrigger value="expected">Expected Assets ({audit.auditExpectedAssets?.length || 0})</TabsTrigger>
              <TabsTrigger value="results">Scan Results ({audit.auditResults?.length || 0})</TabsTrigger>
              <TabsTrigger value="discrepancies">Discrepancies ({discrepancies.length})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="expected">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>System Status</TableHead>
                      <TableHead>Audit Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit.auditExpectedAssets?.map((ea: any) => {
                      const result = audit.auditResults?.find((r: any) => r.assetId === ea.assetId);
                      return (
                        <TableRow key={ea.id}>
                          <TableCell className="font-medium">{ea.asset.assetCode}</TableCell>
                          <TableCell>{ea.asset.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{ea.asset.status?.name || "Unknown"}</Badge>
                          </TableCell>
                          <TableCell>
                            {result ? (
                              <Badge variant="outline" className={result.classification === "VERIFIED" ? "border-green-500 text-green-600" : result.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{result.classification.replace("_", " ")}</Badge>
                            ) : (
                              <Badge variant="outline" className="border-gray-500 text-gray-600">PENDING</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="results">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Code</TableHead>
                      <TableHead>Classification</TableHead>
                      <TableHead>Condition (Physical)</TableHead>
                      <TableHead>Proposed Status</TableHead>
                      <TableHead>Proposed Condition</TableHead>
                      <TableHead>Scanned By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit.auditResults?.map((r: any) => (
                      <TableRow key={r.id}>
                        <TableCell>{r.assetCode || r.asset?.assetCode}</TableCell>
                        <TableCell><Badge variant="outline" className={r.classification === "VERIFIED" ? "border-green-500 text-green-600" : r.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{r.classification}</Badge></TableCell>
                        <TableCell>{r.physicalCondition || "N/A"}</TableCell>
                        <TableCell>{r.newStatus ? r.newStatus.name : "No Change"}</TableCell>
                        <TableCell>{r.newCondition ? r.newCondition.name : "No Change"}</TableCell>
                        <TableCell>{r.scannedBy?.name || "Unknown"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="discrepancies">
              {discrepancies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No discrepancies found.</div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Code</TableHead>
                        <TableHead>Issue</TableHead>
                        <TableHead>System Location</TableHead>
                        <TableHead>Found Location</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discrepancies.map((r: any) => (
                        <TableRow key={r.id}>
                          <TableCell>{r.assetCode || r.asset?.assetCode}</TableCell>
                          <TableCell>
                            <span className="text-red-600 font-medium">{r.classification.replace("_", " ")}</span>
                          </TableCell>
                          <TableCell>
                            {r.asset ? `${r.asset.building?.name || 'Unknown'} / ${r.asset.room?.name || 'Unknown'}` : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {r.classification === "MISSING" ? "N/A (Missing)" : `Audit: ${audit.name}`}
                          </TableCell>
                          <TableCell>{r.remarks || "No remarks"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
