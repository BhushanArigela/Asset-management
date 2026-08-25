const fs = require('fs');
const file = 'src/components/audits/audit-list-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<TableRow key=\{audit\.id\}>/, '<React.Fragment key={audit.id}>\n                    <TableRow>');

// Add toggle button before {audit.name}
content = content.replace(
  /<TableCell className="font-medium">\{audit\.name\}<\/TableCell>/,
  `<TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <button 
                            className="md:hidden focus:outline-none shrink-0"
                            onClick={() => toggleRow(audit.id)}
                          >
                            {expandedRows[audit.id] ? <MinusCircle className="w-[18px] h-[18px] fill-[#ef4444] text-white border-none" /> : <PlusCircle className="w-[18px] h-[18px] fill-[#16a34a] text-white border-none" />}
                          </button>
                          {audit.name}
                        </div>
                      </TableCell>`
);

// Add className="hidden md:table-cell" to the other cells
content = content.replace(/<TableCell>\{audit\.scopeType\}<\/TableCell>/, '<TableCell className="hidden md:table-cell">{audit.scopeType}</TableCell>');
content = content.replace(/<TableCell>\{format\(new Date\(audit\.auditDate\), "PP"\)\}<\/TableCell>/, '<TableCell className="hidden md:table-cell">{format(new Date(audit.auditDate), "PP")}</TableCell>');
content = content.replace(/<TableCell>\{audit\.auditor\?\.name \|\| "Unknown"\}<\/TableCell>/, '<TableCell className="hidden md:table-cell">{audit.auditor?.name || "Unknown"}</TableCell>');

// For Status, it's spanning multiple lines, we can replace the starting tag:
// <TableCell>
//   <Badge variant="outline" className={getStatusColor(audit.status)}>{audit.status.replace("_", " ")}</Badge>
// </TableCell>
content = content.replace(
  /<TableCell>\s*<Badge variant="outline" className=\{getStatusColor\(audit\.status\)\}>\{audit\.status\.replace\("_", " "\)\}<\/Badge>\s*<\/TableCell>/g,
  `<TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className={getStatusColor(audit.status)}>{audit.status.replace("_", " ")}</Badge>
                      </TableCell>`
);

content = content.replace(
  /<TableCell>\s*\{audit\.totalVerified\} \/ \{audit\.totalExpected\} Verified\s*<\/TableCell>/g,
  `<TableCell className="hidden md:table-cell">
                        {audit.totalVerified} / {audit.totalExpected} Verified
                      </TableCell>`
);

// Append expanded row before `))}`
const expandedRow = `</Button>
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
                  ))`;

content = content.replace(/<\/Button>\s*<\/Link>\s*<\/TableCell>\s*<\/TableRow>\s*\)\)/g, expandedRow);

fs.writeFileSync(file, content);
console.log("Done");
