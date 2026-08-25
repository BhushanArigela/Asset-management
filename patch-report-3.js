const fs = require('fs');
const file = 'src/components/reports/report-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

const startIndex = content.indexOf('<div className="overflow-hidden">');
const endIndex = content.lastIndexOf('</CardContent>');

if (startIndex !== -1 && endIndex !== -1) {
  content = content.substring(0, startIndex) + '<DataTable columns={columns} data={data} hideToolbar={true} />\n        ' + content.substring(endIndex);
}

fs.writeFileSync(file, content);
console.log("Done");
