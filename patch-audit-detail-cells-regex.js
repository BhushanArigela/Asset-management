const fs = require('fs');
const file = 'src/components/audits/audit-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Expected Assets:
// <TableCell>
//   <Badge variant="outline">{ea.asset.status?.name || "Unknown"}</Badge>
// </TableCell>
content = content.replace(/<TableCell>(\s*<Badge variant="outline">\{ea\.asset\.status\?\.name)/g, '<TableCell className="hidden md:table-cell">$1');

// <TableCell>
//   {result ? (
content = content.replace(/<TableCell>(\s*\{result \? \()/g, '<TableCell className="hidden md:table-cell">$1');

// Discrepancies:
// <TableCell>
//   <span className="text-red-600 font-medium">{r.classification.replace("_", " ")}</span>
// </TableCell>
content = content.replace(/<TableCell>(\s*<span className="text-red-600 font-medium">\{r\.classification)/g, '<TableCell className="hidden md:table-cell">$1');

// <TableCell>
//   {r.asset ? ...
content = content.replace(/<TableCell>(\s*\{r\.asset \? `\$\{r\.asset\.building)/g, '<TableCell className="hidden md:table-cell">$1');

// <TableCell>
//   {r.classification === "MISSING" ...
content = content.replace(/<TableCell>(\s*\{r\.classification === "MISSING")/g, '<TableCell className="hidden md:table-cell">$1');

// colSpans
content = content.replace(/colSpan=\{1\}/g, 'colSpan={10}');

fs.writeFileSync(file, content);
console.log("Done");
