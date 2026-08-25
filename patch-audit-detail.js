const fs = require('fs');
let file = 'src/components/audits/audit-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The main audit status badge
content = content.replace(/<Badge variant="outline">\{audit\.status\}<\/Badge>/g, '<Badge variant="outline" className={audit.status === "COMPLETED" ? "border-green-500 text-green-600" : audit.status === "IN_PROGRESS" ? "border-orange-500 text-orange-600" : "border-blue-500 text-blue-600"}>{audit.status}</Badge>');

// The result classification badge
content = content.replace(/<Badge className=\{[\s\S]*?\} \?>\s*\{result\.classification\}\s*<\/Badge>/g, '<Badge variant="outline" className={result.classification === "VERIFIED" ? "border-green-500 text-green-600" : result.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{result.classification}</Badge>');

// The PENDING badge
content = content.replace(/<Badge variant="secondary">PENDING<\/Badge>/g, '<Badge variant="outline" className="border-gray-500 text-gray-600">PENDING</Badge>');

// The classification badge in the results table
content = content.replace(/<TableCell><Badge>\{r\.classification\}<\/Badge><\/TableCell>/g, '<TableCell><Badge variant="outline" className={r.classification === "VERIFIED" ? "border-green-500 text-green-600" : r.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{r.classification}</Badge></TableCell>');

fs.writeFileSync(file, content);
console.log("Done");
