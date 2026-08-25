const fs = require('fs');

let file = 'src/components/audits/audit-list-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/case 'SCHEDULED': return 'bg-blue-100 text-blue-800';/, "case 'SCHEDULED': return 'border-blue-500 text-blue-600';");
content = content.replace(/case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';/, "case 'IN_PROGRESS': return 'border-orange-500 text-orange-600';");
content = content.replace(/case 'COMPLETED': return 'bg-green-100 text-green-800';/, "case 'COMPLETED': return 'border-green-500 text-green-600';");
content = content.replace(/default: return 'bg-gray-100 text-gray-800';/, "default: return 'border-gray-500 text-gray-600';");

content = content.replace(/<Badge className=\{getStatusColor\(audit\.status\)\}>\{audit\.status\.replace\("_", " "\)\}<\/Badge>/g, '<Badge variant="outline" className={getStatusColor(audit.status)}>{audit.status.replace("_", " ")}</Badge>');

fs.writeFileSync(file, content);
console.log("Done");
