const fs = require('fs');
const file = 'src/components/audits/audit-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
if (!content.includes('PlusCircle')) {
  content = content.replace(
    'import { ArrowLeft, CheckCircle, Lock, Play, FileText } from "lucide-react";',
    'import { ArrowLeft, CheckCircle, Lock, Play, FileText, PlusCircle, MinusCircle } from "lucide-react";'
  );
}
if (!content.includes('import React')) {
  content = content.replace(
    'import { useState, useEffect } from "react";',
    'import React, { useState, useEffect } from "react";'
  );
}

// 2. State
const stateInjection = `const [expandedExpected, setExpandedExpected] = useState<Record<string, boolean>>({});
  const toggleExpected = (id: string) => setExpandedExpected(prev => ({ ...prev, [id]: !prev[id] }));
  
  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  const toggleResults = (id: string) => setExpandedResults(prev => ({ ...prev, [id]: !prev[id] }));

  const [expandedDiscrepancies, setExpandedDiscrepancies] = useState<Record<string, boolean>>({});
  const toggleDiscrepancies = (id: string) => setExpandedDiscrepancies(prev => ({ ...prev, [id]: !prev[id] }));`;

if (!content.includes('expandedExpected')) {
  content = content.replace(
    'const { data: session } = useSession();',
    `${stateInjection}\n  const { data: session } = useSession();`
  );
}

// 3. Expected Assets Table
content = content.replace(
  '<TableHead>Name</TableHead>',
  '<TableHead className="hidden md:table-cell">Name</TableHead>'
);
content = content.replace(
  '<TableHead>System Status</TableHead>',
  '<TableHead className="hidden md:table-cell">System Status</TableHead>'
);
content = content.replace(
  '<TableHead>Audit Status</TableHead>',
  '<TableHead className="hidden md:table-cell">Audit Status</TableHead>'
);

const oldExpRow = '<TableRow key={ea.id}>\n                            <TableCell className="font-medium">{ea.asset.assetCode}</TableCell>';
const newExpRow = `<React.Fragment key={ea.id}>
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
                            </TableCell>`;
content = content.replace(oldExpRow, newExpRow);

const expCell1 = '<TableCell>{ea.asset.name}</TableCell>';
const expCell1New = '<TableCell className="hidden md:table-cell">{ea.asset.name}</TableCell>';
content = content.replace(expCell1, expCell1New);

const expCell2 = '<TableCell>\n                              <Badge variant="outline">{ea.asset.status?.name || "Unknown"}</Badge>\n                            </TableCell>';
const expCell2New = '<TableCell className="hidden md:table-cell">\n                              <Badge variant="outline">{ea.asset.status?.name || "Unknown"}</Badge>\n                            </TableCell>';
content = content.replace(expCell2, expCell2New);

const expCell3 = `<TableCell>
                              {result ? (
                                <Badge variant="outline" className={result.classification === "VERIFIED" ? "border-green-500 text-green-600" : result.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{result.classification.replace("_", " ")}</Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-500 text-gray-600">PENDING</Badge>
                              )}
                            </TableCell>`;
const expCell3New = `<TableCell className="hidden md:table-cell">
                              {result ? (
                                <Badge variant="outline" className={result.classification === "VERIFIED" ? "border-green-500 text-green-600" : result.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{result.classification.replace("_", " ")}</Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-500 text-gray-600">PENDING</Badge>
                              )}
                            </TableCell>`;
content = content.replace(expCell3, expCell3New);

const expRowEnd = `</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>`;
const expRowEndNew = `</TableCell>
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
                    </TableBody>`;
content = content.replace(expRowEnd, expRowEndNew);


// 4. Scan Results Table
content = content.replace(
  '<TableHead>Classification</TableHead>',
  '<TableHead className="hidden md:table-cell">Classification</TableHead>'
);
content = content.replace(
  '<TableHead>Condition (Physical)</TableHead>',
  '<TableHead className="hidden md:table-cell">Condition (Physical)</TableHead>'
);
content = content.replace(
  '<TableHead>Proposed Status</TableHead>',
  '<TableHead className="hidden md:table-cell">Proposed Status</TableHead>'
);
content = content.replace(
  '<TableHead>Proposed Condition</TableHead>',
  '<TableHead className="hidden md:table-cell">Proposed Condition</TableHead>'
);
content = content.replace(
  '<TableHead>Scanned By</TableHead>',
  '<TableHead className="hidden md:table-cell">Scanned By</TableHead>'
);

const resRowStart = '<TableRow key={r.id}>\n                          <TableCell>{r.assetCode || r.asset?.assetCode}</TableCell>';
const resRowStartNew = `<React.Fragment key={r.id}>
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
                          </TableCell>`;
content = content.replace(resRowStart, resRowStartNew);

content = content.replace(
  '<TableCell><Badge variant="outline" className={r.classification === "VERIFIED" ? "border-green-500 text-green-600" : r.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{r.classification}</Badge></TableCell>',
  '<TableCell className="hidden md:table-cell"><Badge variant="outline" className={r.classification === "VERIFIED" ? "border-green-500 text-green-600" : r.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{r.classification}</Badge></TableCell>'
);
content = content.replace(
  '<TableCell>{r.physicalCondition || "N/A"}</TableCell>',
  '<TableCell className="hidden md:table-cell">{r.physicalCondition || "N/A"}</TableCell>'
);
content = content.replace(
  '<TableCell>{r.newStatus ? r.newStatus.name : "No Change"}</TableCell>',
  '<TableCell className="hidden md:table-cell">{r.newStatus ? r.newStatus.name : "No Change"}</TableCell>'
);
content = content.replace(
  '<TableCell>{r.newCondition ? r.newCondition.name : "No Change"}</TableCell>',
  '<TableCell className="hidden md:table-cell">{r.newCondition ? r.newCondition.name : "No Change"}</TableCell>'
);
content = content.replace(
  '<TableCell>{r.scannedBy?.name || "Unknown"}</TableCell>',
  '<TableCell className="hidden md:table-cell">{r.scannedBy?.name || "Unknown"}</TableCell>'
);

const resRowEnd = `</TableCell>\n                        </TableRow>\n                      ))`;
const resRowEndNew = `</TableCell>
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
                      </React.Fragment>\n                      ))`;
content = content.replace(resRowEnd, resRowEndNew);


// 5. Discrepancies Table
content = content.replace(
  '<TableHead>Issue</TableHead>',
  '<TableHead className="hidden md:table-cell">Issue</TableHead>'
);
content = content.replace(
  '<TableHead>System Location</TableHead>',
  '<TableHead className="hidden md:table-cell">System Location</TableHead>'
);
content = content.replace(
  '<TableHead>Found Location</TableHead>',
  '<TableHead className="hidden md:table-cell">Found Location</TableHead>'
);
content = content.replace(
  '<TableHead>Remarks</TableHead>',
  '<TableHead className="hidden md:table-cell">Remarks</TableHead>'
);

const discRowStart = '<TableRow key={r.id}>\n                            <TableCell>{r.assetCode || r.asset?.assetCode}</TableCell>';
const discRowStartNew = `<React.Fragment key={r.id}>
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
                            </TableCell>`;
content = content.replace(discRowStart, discRowStartNew);

content = content.replace(
  '<TableCell>\n                              <span className="text-red-600 font-medium">{r.classification.replace("_", " ")}</span>\n                            </TableCell>',
  '<TableCell className="hidden md:table-cell">\n                              <span className="text-red-600 font-medium">{r.classification.replace("_", " ")}</span>\n                            </TableCell>'
);
content = content.replace(
  '<TableCell>\n                              {r.asset ? `${r.asset.building?.name || \'Unknown\'} / ${r.asset.room?.name || \'Unknown\'}` : \'Unknown\'}\n                            </TableCell>',
  '<TableCell className="hidden md:table-cell">\n                              {r.asset ? `${r.asset.building?.name || \'Unknown\'} / ${r.asset.room?.name || \'Unknown\'}` : \'Unknown\'}\n                            </TableCell>'
);
content = content.replace(
  '<TableCell>\n                              {r.classification === "MISSING" ? "N/A (Missing)" : `Audit: ${audit.name}`}\n                            </TableCell>',
  '<TableCell className="hidden md:table-cell">\n                              {r.classification === "MISSING" ? "N/A (Missing)" : `Audit: ${audit.name}`}\n                            </TableCell>'
);
content = content.replace(
  '<TableCell>{r.remarks || "No remarks"}</TableCell>',
  '<TableCell className="hidden md:table-cell">{r.remarks || "No remarks"}</TableCell>'
);

const discRowEnd = `</TableCell>\n                          </TableRow>\n                        ))`;
const discRowEndNew = `</TableCell>
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
                        </React.Fragment>\n                        ))`;
content = content.replace(discRowEnd, discRowEndNew);

fs.writeFileSync(file, content);
console.log("Done");
