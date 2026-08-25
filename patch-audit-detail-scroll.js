const fs = require('fs');
const file = 'src/components/audits/audit-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div className="overflow-x-auto">\r?\n\s*<Table>/g,
  '<div>\n                <Table>'
);

fs.writeFileSync(file, content);
console.log("Done");
