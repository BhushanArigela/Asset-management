"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Plus, Search, Filter, Eye , PlusCircle, MinusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";
import { hasPermission, PERMISSIONS } from "@/lib/permissions";

export function AuditListPage() {
  const { data: session } = useSession();
  const canCreateAudit = hasPermission(session?.user?.permissions, [PERMISSIONS.AUDITS_CREATE] as any);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const toggleRow = (id: string) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
  const [audits, setAudits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function fetchAudits() {
      try {
        const params = new URLSearchParams();
        if (statusFilter !== "all") params.append("status", statusFilter);
        if (search) params.append("search", search);
        params.append("page", page.toString());
        params.append("limit", "10");
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/audits?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load audits");
        const json = await res.json();
        if (json.data && json.pagination) {
          setAudits(json.data);
          setTotalPages(json.pagination.totalPages);
          setTotal(json.pagination.total);
        } else {
          setAudits(Array.isArray(json) ? json : []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    
    const timeoutId = setTimeout(() => {
      fetchAudits();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [statusFilter, search, page]);

  const getStatusColor = (status: string) => {
    switch(status) {
      case "PLANNED": return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "IN_PROGRESS": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "COMPLETED": return "bg-green-100 text-green-800 hover:bg-green-100";
      case "LOCKED": return "bg-slate-200 text-slate-800 hover:bg-slate-200";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-2xl font-bold tracking-tight">Physical Audits</h2>
        </div>
        <div className="flex items-center space-x-2">
          {canCreateAudit && (
            <Link href="/audits/new">
              <Button className="bg-[#1B2A4A] text-white">
                <Plus className="w-4 h-4 mr-2" /> New Audit
              </Button>
            </Link>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search audits..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-8 w-full sm:w-[250px]"
              />
            </div>
            <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PLANNED">Planned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="LOCKED">Locked</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Audit Name</TableHead>
                <TableHead className="hidden md:table-cell">Scope</TableHead>
                <TableHead className="hidden md:table-cell">Date</TableHead>
                <TableHead className="hidden md:table-cell">Auditor</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">Loading audits...</TableCell>
                </TableRow>
              ) : audits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">No audits found.</TableCell>
                </TableRow>
              ) : (
                audits.map((audit) => (
                  <React.Fragment key={audit.id}>
                    <TableRow>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <button 
                            className="md:hidden focus:outline-none shrink-0"
                            onClick={() => toggleRow(audit.id)}
                          >
                            {expandedRows[audit.id] ? <MinusCircle className="w-[18px] h-[18px] fill-[#ef4444] text-white border-none" /> : <PlusCircle className="w-[18px] h-[18px] fill-[#16a34a] text-white border-none" />}
                          </button>
                          {audit.name}
                        </div>
                      </TableCell>
                    <TableCell className="hidden md:table-cell">{audit.scopeType}</TableCell>
                    <TableCell className="hidden md:table-cell">{format(new Date(audit.auditDate), "PP")}</TableCell>
                    <TableCell className="hidden md:table-cell">{audit.auditor?.name || "Unknown"}</TableCell>
                    <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className={getStatusColor(audit.status)}>{audit.status.replace("_", " ")}</Badge>
                      </TableCell>
                    <TableCell className="hidden md:table-cell">
                        {audit.totalVerified} / {audit.totalExpected} Verified
                      </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/audits/${audit.id}`}>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4 mr-2" /> View
                        </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                    {expandedRows[audit.id] && (
                      <TableRow className="md:hidden bg-green-50/30">
                        <TableCell colSpan={2}>
                          <div className="py-2 space-y-3 px-2">
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Scope</div>
                              <div className="col-span-2 text-sm text-gray-700">{audit.scopeType}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Date</div>
                              <div className="col-span-2 text-sm text-gray-700">{format(new Date(audit.auditDate), "PP")}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Auditor</div>
                              <div className="col-span-2 text-sm text-gray-700">{audit.auditor?.name || "Unknown"}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Status</div>
                              <div className="col-span-2 text-sm text-gray-700">
                                <Badge variant="outline" className={getStatusColor(audit.status)}>{audit.status.replace("_", " ")}</Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Progress</div>
                              <div className="col-span-2 text-sm text-gray-700">{audit.totalVerified} / {audit.totalExpected} Verified</div>
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

          {total > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between mt-4 gap-4">
                <div className="text-sm text-muted-foreground text-center sm:text-left w-full sm:w-auto">
                  Page {page} of {totalPages || 1} (Total {total} audits)
                </div>
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-center sm:justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
