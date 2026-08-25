const fs = require('fs');
const file = 'src/components/audits/audit-list-page.tsx';

let content = fs.readFileSync(file, 'utf8');

if (!content.includes('PlusCircle')) {
  content = content.replace(
    'import { Plus, Search, Filter, MoreHorizontal, FileText, CheckCircle, Clock, Ban } from "lucide-react";',
    'import { Plus, Search, Filter, MoreHorizontal, FileText, CheckCircle, Clock, Ban, PlusCircle, MinusCircle } from "lucide-react";'
  );
}

if (!content.includes('expandedRows')) {
  content = content.replace(
    'const [isFiltersOpen, setIsFiltersOpen] = useState(false);',
    'const [isFiltersOpen, setIsFiltersOpen] = useState(false);\n  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});\n  const toggleRow = (id: string) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));'
  );
}

content = content.replace(
  /<TableHead>Audit Title<\/TableHead>[\s\S]*?<TableHead className="text-right">Actions<\/TableHead>/m,
  `<TableHead>Audit Title</TableHead>
                <TableHead className="hidden md:table-cell">Status</TableHead>
                <TableHead className="hidden md:table-cell">Start Date</TableHead>
                <TableHead className="hidden md:table-cell">End Date</TableHead>
                <TableHead className="hidden md:table-cell">Conducted By</TableHead>
                <TableHead className="hidden md:table-cell">Location</TableHead>
                <TableHead className="hidden md:table-cell">Progress</TableHead>
                <TableHead className="text-right">Actions</TableHead>`
);

const oldRowStr = `<TableRow key={audit.id} className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(\`/audits/\${audit.id}\`)}>
                    <TableCell className="font-medium text-[#1B2A4A]">{audit.title}</TableCell>`;
const newRowStr = `<React.Fragment key={audit.id}>
                    <TableRow className="cursor-pointer hover:bg-slate-50" onClick={() => router.push(\`/audits/\${audit.id}\`)}>
                    <TableCell className="font-medium text-[#1B2A4A]">
                      <div className="flex items-center gap-2">
                        <button 
                          className="md:hidden focus:outline-none shrink-0"
                          onClick={(e) => { e.stopPropagation(); toggleRow(audit.id); }}
                        >
                          {expandedRows[audit.id] ? <MinusCircle className="w-[18px] h-[18px] fill-[#ef4444] text-white border-none" /> : <PlusCircle className="w-[18px] h-[18px] fill-[#16a34a] text-white border-none" />}
                        </button>
                        {audit.title}
                      </div>
                    </TableCell>`;

content = content.replace(oldRowStr, newRowStr);

const oldCellsStr = `<TableCell>
                      <Badge variant="outline" className={getStatusColor(audit.status)}>
                        {getStatusIcon(audit.status)}
                        {audit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{formatDate(audit.startDate)}</TableCell>
                    <TableCell className="text-slate-600">{formatDate(audit.endDate)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                          {audit.conductedBy?.firstName?.charAt(0)}{audit.conductedBy?.lastName?.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-700">{audit.conductedBy?.firstName} {audit.conductedBy?.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {audit.location?.name || "All Locations"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                          <div className="bg-[#1B2A4A] h-2 rounded-full" style={{ width: \`\${progress}%\` }}></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{progress}%</span>
                      </div>
                    </TableCell>`;

const newCellsStr = `<TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={getStatusColor(audit.status)}>
                        {getStatusIcon(audit.status)}
                        {audit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600">{formatDate(audit.startDate)}</TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600">{formatDate(audit.endDate)}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                          {audit.conductedBy?.firstName?.charAt(0)}{audit.conductedBy?.lastName?.charAt(0)}
                        </div>
                        <span className="text-sm text-slate-700">{audit.conductedBy?.firstName} {audit.conductedBy?.lastName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-slate-600">
                      {audit.location?.name || "All Locations"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-100 rounded-full h-2 max-w-[100px]">
                          <div className="bg-[#1B2A4A] h-2 rounded-full" style={{ width: \`\${progress}%\` }}></div>
                        </div>
                        <span className="text-xs font-medium text-slate-600">{progress}%</span>
                      </div>
                    </TableCell>`;

content = content.replace(oldCellsStr, newCellsStr);

const endOfRow = /<\/DropdownMenu>[\s\S]*?<\/TableCell>[\s\S]*?<\/TableRow>/m;
const expandedRowCode = `</DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedRows[audit.id] && (
                      <TableRow className="md:hidden bg-green-50/30">
                        <TableCell colSpan={2}>
                          <div className="py-2 space-y-3 px-2">
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Status</div>
                              <div className="col-span-2 text-sm text-gray-700">
                                <Badge variant="outline" className={getStatusColor(audit.status)}>
                                  {getStatusIcon(audit.status)}
                                  {audit.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Dates</div>
                              <div className="col-span-2 text-sm text-gray-700">{formatDate(audit.startDate)} - {formatDate(audit.endDate)}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Conducted By</div>
                              <div className="col-span-2 text-sm text-gray-700">{audit.conductedBy?.firstName} {audit.conductedBy?.lastName}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Location</div>
                              <div className="col-span-2 text-sm text-gray-700">{audit.location?.name || "All Locations"}</div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div className="font-semibold text-sm text-[#1B2A4A]">Progress</div>
                              <div className="col-span-2 text-sm text-gray-700">{progress}%</div>
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
console.log("Audits done");
