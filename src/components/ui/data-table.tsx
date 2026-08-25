
"use client";

import * as React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getFilteredRowModel,
  getExpandedRowModel,
  ExpandedState,
  ColumnFiltersState,
} from "@tanstack/react-table";
import { Search, PlusCircle, MinusCircle } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  hideToolbar?: boolean;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  hideToolbar = false,
}: DataTableProps<TData, TValue>) {
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [expanded, setExpanded] = React.useState<ExpandedState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    globalFilterFn: "includesString",
    state: {
      globalFilter,
      expanded,
    },
  });

  // Decide which columns to hide on mobile
  const isMobileHidden = (index: number, total: number) => {
    // Keep first column (index 0) and last column (actions, index total - 1) visible.
    if (index === 0) return false;
    if (index === total - 1) return false;
    return true;
  };

  return (
    <Card>
      <CardContent className="p-6">
        {!hideToolbar && (<div className="flex items-center pb-4">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-8"
          />
        </div>
      </div>)}
      <div>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header, index) => {
                  const hidden = isMobileHidden(index, group.headers.length);
                  return (
                    <TableHead 
                      key={header.id}
                      className={cn(hidden && "hidden md:table-cell", "whitespace-nowrap")}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell, index) => {
                      const hidden = isMobileHidden(index, row.getVisibleCells().length);
                      return (
                        <TableCell 
                          key={cell.id} 
                          className={cn(hidden && "hidden md:table-cell")}
                        >
                          <div className="flex items-center gap-2">
                            {/* Render expand toggle on first cell for mobile ONLY */}
                            {index === 0 && (
                              <button 
                                className="md:hidden focus:outline-none shrink-0"
                                onClick={() => row.toggleExpanded()}
                              >
                                {row.getIsExpanded() ? <MinusCircle className="w-[18px] h-[18px] fill-[#ef4444] text-white border-none" /> : <PlusCircle className="w-[18px] h-[18px] fill-[#16a34a] text-white border-none" />}
                              </button>
                            )}
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </div>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {/* Expanded Mobile Row */}
                  {row.getIsExpanded() && (
                    <TableRow className="md:hidden bg-green-50/30">
                      <TableCell colSpan={row.getVisibleCells().filter((_, i) => !isMobileHidden(i, row.getVisibleCells().length)).length}>
                        <div className="py-2 space-y-3 px-2">
                          {row.getVisibleCells().map((cell, index) => {
                            if (!isMobileHidden(index, row.getVisibleCells().length)) return null;
                            const headerStr = typeof cell.column.columnDef.header === 'string' 
                              ? cell.column.columnDef.header 
                              : cell.column.id;
                            
                            return (
                              <div key={cell.id} className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                                <div className="font-semibold text-sm text-[#1B2A4A] capitalize">{headerStr}</div>
                                <div className="col-span-2 text-sm text-gray-700 overflow-hidden break-words">
                                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {!hideToolbar && (<div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} entries
        </div>
        <div className="flex space-x-2">
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
      </div>)}
    </CardContent>
  </Card>
);
}
