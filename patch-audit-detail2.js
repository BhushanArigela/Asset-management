const fs = require('fs');
let file = 'src/components/audits/audit-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<Badge className=\{[\s\S]*?\}>\s*\{result\.classification\.replace\("_", " "\)\}\s*<\/Badge>/;
const replacement = '<Badge variant="outline" className={result.classification === "VERIFIED" ? "border-green-500 text-green-600" : result.classification === "MISSING" ? "border-red-500 text-red-600" : "border-orange-500 text-orange-600"}>{result.classification.replace("_", " ")}</Badge>';

content = content.replace(regex, replacement);

fs.writeFileSync(file, content);
console.log("Done");
