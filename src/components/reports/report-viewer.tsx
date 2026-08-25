"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Download, Filter, Printer, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  flexRender, 
  ColumnDef 
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

interface ReportViewerProps {
  type: string;
}

export function ReportViewer({ type }: ReportViewerProps) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [buildingId, setBuildingId] = useState("");

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ type });
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);
      if (buildingId && buildingId !== "all") params.append("buildingId", buildingId);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/reports?${params.toString()}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Failed to fetch report: ${res.status} ${text}`);
      }
      
      const json = await res.json();
      setData(json);
    } catch (error) {
      toast.error("Failed to load report data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams({ type, format: "excel" });
    if (dateFrom) params.append("dateFrom", dateFrom);
    if (dateTo) params.append("dateTo", dateTo);
    if (buildingId && buildingId !== "all") params.append("buildingId", buildingId);

    window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/reports?${params.toString()}`;
  };

  useEffect(() => {
    fetchReport();
  }, [type]);

  const columns: ColumnDef<any>[] = [
    { accessorKey: "assetCode", header: "Code" },
    { accessorKey: "name", header: "Name" },
    { 
      id: "status",
      accessorFn: (row) => row.status?.name || "N/A", 
      header: "Status" 
    },
    { 
      id: "condition",
      accessorFn: (row) => row.condition?.name || "N/A", 
      header: "Condition" 
    },
    { 
      id: "category",
      accessorFn: (row) => row.category?.name || "N/A", 
      header: "Category" 
    },
    { 
      id: "building",
      accessorFn: (row) => row.building?.name || "N/A", 
      header: "Building" 
    },
    { 
      accessorKey: "createdAt", 
      header: "Added Date",
      cell: ({ row }) => {
        const val = row.getValue("createdAt") as string;
        return val ? format(new Date(val), "PP") : "N/A";
      }
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" /> Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="space-y-2">
              <Label>From Date</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>To Date</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Building</Label>
              <Select value={buildingId} onValueChange={setBuildingId}>
                <SelectTrigger><SelectValue placeholder="All Buildings" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Buildings</SelectItem>
                  <SelectItem value="b1">Main Tower</SelectItem>
                  <SelectItem value="b2">West Wing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button onClick={fetchReport} className="bg-[#1B2A4A] flex-1">Apply Filters</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl capitalize flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#C5A55A]" /> 
            {type.replace(/-/g, " ")} Report
            <span className="text-sm font-normal text-muted-foreground ml-2">({data.length} records)</span>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.print()}><Printer className="w-4 h-4 mr-2" /> Print</Button>
            <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 text-white">
              <Download className="w-4 h-4 mr-2" /> Export Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">Loading...</TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">No results.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
