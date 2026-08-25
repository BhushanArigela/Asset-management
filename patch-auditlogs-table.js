const fs = require('fs');
const file = 'src/app/(dashboard)/audit-logs/page.tsx';

let content = fs.readFileSync(file, 'utf8');

if (!content.includes('PlusCircle')) {
  content = content.replace(
    'import { FileDown, Search, Filter, RefreshCw, Activity, ArrowRight, User, Settings, Database, MoreVertical, X } from "lucide-react";',
    'import { FileDown, Search, Filter, RefreshCw, Activity, ArrowRight, User, Settings, Database, MoreVertical, X, PlusCircle, MinusCircle } from "lucide-react";'
  );
}

if (!content.includes('expandedRows')) {
  content = content.replace(
    'const [isFiltersOpen, setIsFiltersOpen] = useState(false);',
    'const [isFiltersOpen, setIsFiltersOpen] = useState(false);\n  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});\n  const toggleRow = (id: string) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));'
  );
}

content = content.replace(
  /<TableHead>Date & Time<\/TableHead>[\s\S]*?<TableHead className="w-\[100px\]">Details<\/TableHead>/m,
  `<TableHead>Date & Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead className="hidden md:table-cell">Action</TableHead>
                      <TableHead className="hidden md:table-cell">Module</TableHead>
                      <TableHead className="hidden md:table-cell">IP Address</TableHead>
                      <TableHead className="w-[100px]">Details</TableHead>`
);

content = content.replace(
  /<TableRow key=\{log.id\} className="group">[\s\S]*?<TableCell className="whitespace-nowrap text-sm font-medium">/m,
  `<React.Fragment key={log.id}>
                    <TableRow className="group">
                      <TableCell className="whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button 
                            className="md:hidden focus:outline-none shrink-0"
                            onClick={() => toggleRow(log.id)}
                          >
                            {expandedRows[log.id] ? <MinusCircle className="w-[18px] h-[18px] fill-[#ef4444] text-white border-none" /> : <PlusCircle className="w-[18px] h-[18px] fill-[#16a34a] text-white border-none" />}
                          </button>`
);

const oldCellsStr = `<TableCell>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getModuleIcon(log.module)}
                          <span className="font-medium text-gray-900">{log.module}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-500 font-mono text-xs">
                        {log.ipAddress || "-"}
                      </TableCell>`;

const newCellsStr = `<TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getActionColor(log.action)}>
                            {log.action}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {getModuleIcon(log.module)}
                          <span className="font-medium text-gray-900">{log.module}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-gray-500 font-mono text-xs">
                        {log.ipAddress || "-"}
                      </TableCell>`;

content = content.replace(oldCellsStr, newCellsStr);

const endOfRow = /<\/Dialog>[\s\S]*?<\/TableCell>[\s\S]*?<\/TableRow>/m;
const expandedRowCode = `</Dialog>
                      </TableCell>
                    </TableRow>
                    {expandedRows[log.id] && (
                      <TableRow className="md:hidden bg-green-50/30">
                        <TableCell colSpan={3}>
                          <div className="py-2 space-y-3 px-2">
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Action</div>
                              <div className="col-span-2 text-sm text-gray-700">
                                <Badge variant="outline" className={getActionColor(log.action)}>
                                  {log.action}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Module</div>
                              <div className="col-span-2 text-sm text-gray-700 flex items-center gap-2">
                                {getModuleIcon(log.module)} {log.module}
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">IP Address</div>
                              <div className="col-span-2 text-sm text-gray-700 font-mono text-xs">
                                {log.ipAddress || "-"}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>`;

content = content.replace(endOfRow, expandedRowCode);

if (!content.includes('import React')) {
  content = content.replace('import { useState', 'import React, { useState');
}

fs.writeFileSync(file, content);
console.log("Audit Logs done");
