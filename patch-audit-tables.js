const fs = require('fs');
const file = 'src/components/audits/audit-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Expected Table Row Start
content = content.replace(
  /<TableRow key=\{ea\.id\}>\r?\n\s*<TableCell className="font-medium">\{ea\.asset\.assetCode\}<\/TableCell>/g,
  `<React.Fragment key={ea.id}>
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
                            </TableCell>`
);

// Expected Table Row End
const expRowEndRegex = /<\/TableCell>\r?\n\s*<\/TableRow>\r?\n\s*\);\r?\n\s*\}\)\}\r?\n\s*<\/TableBody>/g;
content = content.replace(
  expRowEndRegex,
  `</TableCell>
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
                    </TableBody>`
);

// Discrepancies Table Row Start
content = content.replace(
  /<TableRow key=\{r\.id\}>\r?\n\s*<TableCell>\{r\.assetCode \|\| r\.asset\?\.assetCode\}<\/TableCell>/g,
  `<React.Fragment key={r.id}>
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
                            </TableCell>`
);

// Discrepancies Table Row End
// Discrepancies previously failed because it ends with `))`:
const discRowEndRegex = /<\/TableCell>\r?\n\s*<\/TableRow>\r?\n\s*\)\)\}\r?\n\s*<\/TableBody>/g;
content = content.replace(
  discRowEndRegex,
  `</TableCell>
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
                                    <div className="col-span-2 text-sm text-gray-700">{r.asset ? \`\${r.asset.building?.name || 'Unknown'} / \${r.asset.room?.name || 'Unknown'}\` : 'Unknown'}</div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-2 border-b border-gray-100 pb-2">
                                    <div className="font-semibold text-sm text-[#1B2A4A]">Found Loc</div>
                                    <div className="col-span-2 text-sm text-gray-700">{r.classification === "MISSING" ? "N/A (Missing)" : \`Audit: \${audit.name}\`}</div>
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
                      </TableBody>`
);

fs.writeFileSync(file, content);
console.log("Done");
