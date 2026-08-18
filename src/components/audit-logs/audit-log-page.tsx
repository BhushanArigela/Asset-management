"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Download, Search, Activity, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

export function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  
  // Filters
  const [moduleFilter, setModuleFilter] = useState("all");
  const [actionFilter, setActionFilter] = useState("all");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (moduleFilter !== "all") params.append("module", moduleFilter);
      if (actionFilter !== "all") params.append("action", actionFilter);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch logs");
      
      const json = await res.json();
      setLogs(json);
    } catch (error) {
      toast.error("Failed to load audit logs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [moduleFilter, actionFilter]);

  const toggleRow = (id: string) => {
    setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const exportLogs = () => {
    const params = new URLSearchParams({ format: "excel" });
    if (moduleFilter !== "all") params.append("module", moduleFilter);
    if (actionFilter !== "all") params.append("action", actionFilter);
    window.location.href = `/api/audit-logs?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" /> Filter Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>Module</Label>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger><SelectValue placeholder="All Modules" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modules</SelectItem>
                  <SelectItem value="ASSET">Asset Management</SelectItem>
                  <SelectItem value="AUDIT">Physical Audits</SelectItem>
                  <SelectItem value="USER">User Management</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger><SelectValue placeholder="All Actions" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Actions</SelectItem>
                  <SelectItem value="CREATE">Create</SelectItem>
                  <SelectItem value="UPDATE">Update</SelectItem>
                  <SelectItem value="DELETE">Delete</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 md:col-span-2 justify-end">
              <Button onClick={fetchLogs} variant="outline">Refresh</Button>
              <Button onClick={exportLogs} className="bg-[#1B2A4A]">
                <Download className="w-4 h-4 mr-2" /> Export Logs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#C5A55A]" /> System Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Module</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">Loading logs...</TableCell>
                  </TableRow>
                ) : logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">No logs found.</TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <React.Fragment key={log.id}>
                      <TableRow className="cursor-pointer hover:bg-slate-50" onClick={() => toggleRow(log.id)}>
                        <TableCell>
                          {expandedRows[log.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">
                          {format(new Date(log.createdAt), "MMM d, yyyy HH:mm:ss")}
                        </TableCell>
                        <TableCell>{log.user?.name || log.userId}</TableCell>
                        <TableCell>
                          <span className="px-2 py-1 bg-slate-100 text-xs font-semibold rounded-md">
                            {log.module}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs font-bold rounded-md ${
                            log.action === 'CREATE' ? 'bg-green-100 text-green-700' :
                            log.action === 'DELETE' ? 'bg-red-100 text-red-700' :
                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell>{log.entityType} ({log.entityId.substring(0, 8)}...)</TableCell>
                        <TableCell className="text-muted-foreground text-sm">{log.ipAddress || 'N/A'}</TableCell>
                      </TableRow>
                      {expandedRows[log.id] && (
                        <TableRow className="bg-slate-50">
                          <TableCell colSpan={7}>
                            <div className="p-4 grid grid-cols-2 gap-4 text-sm font-mono bg-slate-900 text-green-400 rounded-md overflow-x-auto">
                              <div>
                                <h4 className="text-slate-400 mb-2 border-b border-slate-700 pb-1">Previous Value</h4>
                                <pre>{log.previousValue ? JSON.stringify(log.previousValue, null, 2) : 'null'}</pre>
                              </div>
                              <div>
                                <h4 className="text-slate-400 mb-2 border-b border-slate-700 pb-1">New Value</h4>
                                <pre>{log.newValue ? JSON.stringify(log.newValue, null, 2) : 'null'}</pre>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
