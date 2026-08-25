const fs = require('fs');
const file = 'src/components/reports/report-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<DataTable columns={columns} data={data} hideToolbar={true} />',
  '<DataTable columns={columns} data={data} hideToolbar={true} noCard={true} />'
);

fs.writeFileSync(file, content);
console.log("Done");
