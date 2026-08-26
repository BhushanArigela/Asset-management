const fs = require('fs');
const file = 'src/components/audits/audit-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Patch Expected Assets TableCells
const targetExpected1 = `<TableCell>
                              <Badge variant="outline">{ea.asset.status?.name || "Unknown"}</Badge>
                            </TableCell>`;
const replacementExpected1 = `<TableCell className="hidden md:table-cell">
                              <Badge variant="outline">{ea.asset.status?.name || "Unknown"}</Badge>
                            </TableCell>`;
const targetExpected2 = `<TableCell>
                              {result ? (
                                <Badge variant="outline" className={result.classification === "VERIFIED" ? "border-green-500 text-green-600" : result.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{result.classification.replace("_", " ")}</Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-500 text-gray-600">PENDING</Badge>
                              )}
                            </TableCell>`;
const replacementExpected2 = `<TableCell className="hidden md:table-cell">
                              {result ? (
                                <Badge variant="outline" className={result.classification === "VERIFIED" ? "border-green-500 text-green-600" : result.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{result.classification.replace("_", " ")}</Badge>
                              ) : (
                                <Badge variant="outline" className="border-gray-500 text-gray-600">PENDING</Badge>
                              )}
                            </TableCell>`;

// Patch Discrepancies TableCells
const targetDisc1 = `<TableCell>
                              <span className="text-red-600 font-medium">{r.classification.replace("_", " ")}</span>
                            </TableCell>`;
const replacementDisc1 = `<TableCell className="hidden md:table-cell">
                              <span className="text-red-600 font-medium">{r.classification.replace("_", " ")}</span>
                            </TableCell>`;
const targetDisc2 = `<TableCell>
                              {r.asset ? \`\${r.asset.building?.name || 'Unknown'} / \${r.asset.room?.name || 'Unknown'}\` : 'Unknown'}
                            </TableCell>`;
const replacementDisc2 = `<TableCell className="hidden md:table-cell">
                              {r.asset ? \`\${r.asset.building?.name || 'Unknown'} / \${r.asset.room?.name || 'Unknown'}\` : 'Unknown'}
                            </TableCell>`;
const targetDisc3 = `<TableCell>
                              {r.classification === "MISSING" ? "N/A (Missing)" : \`Audit: \${audit.name}\`}
                            </TableCell>`;
const replacementDisc3 = `<TableCell className="hidden md:table-cell">
                              {r.classification === "MISSING" ? "N/A (Missing)" : \`Audit: \${audit.name}\`}
                            </TableCell>`;

const doReplace = (c, tgt, rep) => {
    const crlfTgt = tgt.replace(/\n/g, '\r\n');
    if (c.includes(tgt)) return c.replace(tgt, rep);
    if (c.includes(crlfTgt)) return c.replace(crlfTgt, rep.replace(/\n/g, '\r\n'));
    console.log("Failed to match:", tgt.substring(0, 50));
    return c;
};

content = doReplace(content, targetExpected1, replacementExpected1);
content = doReplace(content, targetExpected2, replacementExpected2);
content = doReplace(content, targetDisc1, replacementDisc1);
content = doReplace(content, targetDisc2, replacementDisc2);
content = doReplace(content, targetDisc3, replacementDisc3);

// Let's also fix colSpans from 1 to 4/6/5 just to be safe across different breakpoints
// Since the expanded row is hidden on desktop anyway, any big colSpan is fine.
content = content.replace(/colSpan=\{1\}/g, 'colSpan={10}');

fs.writeFileSync(file, content);
console.log("Done");
