"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { Play, CheckCircle, Lock, Camera, AlertTriangle, FileText, PlusCircle, MinusCircle } from "lucide-react";
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
  const [expandedExpected, setExpandedExpected] = useState<Record<string, boolean>>({});
  const toggleExpected = (id: string) => setExpandedExpected(prev => ({ ...prev, [id]: !prev[id] }));
  
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  const toggleResults = (id: string) => setExpandedResults(prev => ({ ...prev, [id]: !prev[id] }));

  const [expandedDiscrepancies, setExpandedDiscrepancies] = useState<Record<string, boolean>>({});
  const toggleDiscrepancies = (id: string) => setExpandedDiscrepancies(prev => ({ ...prev, [id]: !prev[id] }));
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        <Card className="col-span-2 md:col-span-4 lg:col-span-2">
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
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Code</TableHead>
                      <TableHead className="hidden md:table-cell">Name</TableHead>
                      <TableHead className="hidden md:table-cell">System Status</TableHead>
                      <TableHead className="hidden md:table-cell">Audit Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit.auditExpectedAssets?.map((ea: any) => {
                      const result = audit.auditResults?.find((r: any) => r.assetId === ea.assetId);
                      return (
                        <React.Fragment key={ea.id}>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <button 
                                  className="md:hidden focus:outline-none shrink-0"
                                  onClick={() => toggleExpected(ea.id)}
                                >
                                  {expandedExpected[ea.id] ? <MinusCircle className="w-[18px] h-[18px] fill-[#ef4444] text-white border-none" /> : <PlusCircle className="w-[18px] h-[18px] fill-[#16a34a] text-white border-none" />}
                                </button>
                                {ea.asset.assetCode}
                              </div>
                            </TableCell>
                          <TableCell className="hidden md:table-cell">{ea.asset.name}</TableCell>
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
                          {expandedExpected[ea.id] && (
                            <TableRow className="md:hidden bg-green-50/30">
                              <TableCell colSpan={1}>
                                <div className="py-2 space-y-3 px-2">
                                  <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                    <div className="font-semibold text-sm text-[#1B2A4A]">Name</div>
                                    <div className="col-span-2 text-sm text-gray-700">{ea.asset.name}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                    <div className="font-semibold text-sm text-[#1B2A4A]">System Status</div>
                                    <div className="col-span-2 text-sm text-gray-700">
                                      <Badge variant="outline">{ea.asset.status?.name || "Unknown"}</Badge>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                    <div className="font-semibold text-sm text-[#1B2A4A]">Audit Status</div>
                                    <div className="col-span-2 text-sm text-gray-700">
                                      {result ? (
                                        <Badge variant="outline" className={result.classification === "VERIFIED" ? "border-green-500 text-green-600" : result.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{result.classification.replace("_", " ")}</Badge>
                                      ) : (
                                        <Badge variant="outline" className="border-gray-500 text-gray-600">PENDING</Badge>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                        );
                      })}
                    </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="results">
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset Code</TableHead>
                      <TableHead className="hidden md:table-cell">Classification</TableHead>
                      <TableHead className="hidden md:table-cell">Condition (Physical)</TableHead>
                      <TableHead className="hidden md:table-cell">Proposed Status</TableHead>
                      <TableHead className="hidden md:table-cell">Proposed Condition</TableHead>
                      <TableHead className="hidden md:table-cell">Scanned By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {audit.auditResults?.map((r: any) => (
                      <React.Fragment key={r.id}>
                          <TableRow>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <button 
                                  className="md:hidden focus:outline-none shrink-0"
                                  onClick={() => toggleDiscrepancies(r.id)}
                                >
                                  {expandedDiscrepancies[r.id] ? <MinusCircle className="w-[18px] h-[18px] fill-[#ef4444] text-white border-none" /> : <PlusCircle className="w-[18px] h-[18px] fill-[#16a34a] text-white border-none" />}
                                </button>
                                {r.assetCode || r.asset?.assetCode}
                              </div>
                            </TableCell>
                        <TableCell className="hidden md:table-cell"><Badge variant="outline" className={r.classification === "VERIFIED" ? "border-green-500 text-green-600" : r.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{r.classification}</Badge></TableCell>
                        <TableCell className="hidden md:table-cell">{r.physicalCondition || "N/A"}</TableCell>
                        <TableCell className="hidden md:table-cell">{r.newStatus ? r.newStatus.name : "No Change"}</TableCell>
                        <TableCell className="hidden md:table-cell">{r.newCondition ? r.newCondition.name : "No Change"}</TableCell>
                        <TableCell className="hidden md:table-cell">{r.scannedBy?.name || "Unknown"}</TableCell>
                          </TableRow>
                          {expandedDiscrepancies[r.id] && (
                            <TableRow className="md:hidden bg-green-50/30">
                              <TableCell colSpan={1}>
                                <div className="py-2 space-y-3 px-2">
                                  <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                    <div className="font-semibold text-sm text-[#1B2A4A]">Issue</div>
                                    <div className="col-span-2 text-sm text-gray-700"><span className="text-red-600 font-medium">{r.classification.replace("_", " ")}</span></div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                    <div className="font-semibold text-sm text-[#1B2A4A]">Sys Location</div>
                                    <div className="col-span-2 text-sm text-gray-700">{r.asset ? `${r.asset.building?.name || 'Unknown'} / ${r.asset.room?.name || 'Unknown'}` : 'Unknown'}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                    <div className="font-semibold text-sm text-[#1B2A4A]">Found Loc</div>
                                    <div className="col-span-2 text-sm text-gray-700">{r.classification === "MISSING" ? "N/A (Missing)" : `Audit: ${audit.name}`}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                    <div className="font-semibold text-sm text-[#1B2A4A]">Remarks</div>
                                    <div className="col-span-2 text-sm text-gray-700">{r.remarks || "No remarks"}</div>
                                  </div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                        ))}
                      </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="discrepancies">
              {discrepancies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No discrepancies found.</div>
              ) : (
                <div>
                <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset Code</TableHead>
                        <TableHead className="hidden md:table-cell">Issue</TableHead>
                        <TableHead className="hidden md:table-cell">System Location</TableHead>
                        <TableHead className="hidden md:table-cell">Found Location</TableHead>
                        <TableHead className="hidden md:table-cell">Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {discrepancies.map((r: any) => (
                        <React.Fragment key={r.id}>
                        <TableRow>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <button 
                                className="md:hidden focus:outline-none shrink-0"
                                onClick={() => toggleResults(r.id)}
                              >
                                {expandedResults[r.id] ? <MinusCircle className="w-[18px] h-[18px] fill-[#ef4444] text-white border-none" /> : <PlusCircle className="w-[18px] h-[18px] fill-[#16a34a] text-white border-none" />}
                              </button>
                              {r.assetCode || r.asset?.assetCode}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-red-600 font-medium">{r.classification.replace("_", " ")}</span>
                          </TableCell>
                          <TableCell>
                            {r.asset ? `${r.asset.building?.name || 'Unknown'} / ${r.asset.room?.name || 'Unknown'}` : 'Unknown'}
                          </TableCell>
                          <TableCell>
                            {r.classification === "MISSING" ? "N/A (Missing)" : `Audit: ${audit.name}`}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{r.remarks || "No remarks"}</TableCell>
                        </TableRow>
                        {expandedResults[r.id] && (
                          <TableRow className="md:hidden bg-green-50/30">
                            <TableCell colSpan={1}>
                              <div className="py-2 space-y-3 px-2">
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                  <div className="font-semibold text-sm text-[#1B2A4A]">Classification</div>
                                  <div className="col-span-2 text-sm text-gray-700"><Badge variant="outline" className={r.classification === "VERIFIED" ? "border-green-500 text-green-600" : r.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{r.classification}</Badge></div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                  <div className="font-semibold text-sm text-[#1B2A4A]">Condition</div>
                                  <div className="col-span-2 text-sm text-gray-700">{r.physicalCondition || "N/A"}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                  <div className="font-semibold text-sm text-[#1B2A4A]">Proposed Status</div>
                                  <div className="col-span-2 text-sm text-gray-700">{r.newStatus ? r.newStatus.name : "No Change"}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                  <div className="font-semibold text-sm text-[#1B2A4A]">Proposed Cond.</div>
                                  <div className="col-span-2 text-sm text-gray-700">{r.newCondition ? r.newCondition.name : "No Change"}</div>
                                </div>
                                <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                  <div className="font-semibold text-sm text-[#1B2A4A]">Scanned By</div>
                                  <div className="col-span-2 text-sm text-gray-700">{r.scannedBy?.name || "Unknown"}</div>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </React.Fragment>
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
