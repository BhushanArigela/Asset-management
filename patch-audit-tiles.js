const fs = require('fs');
const file = 'src/components/audits/audit-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">',
  '<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">'
);

content = content.replace(
  '<Card className="lg:col-span-2">',
  '<Card className="col-span-2 md:col-span-3 lg:col-span-2">'
);

fs.writeFileSync(file, content);
console.log("Done");
