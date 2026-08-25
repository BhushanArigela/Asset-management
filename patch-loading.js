const fs = require('fs');
const file = 'src/components/reports/report-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<DataTable columns={columns} data={data} hideToolbar={true} />',
  '{loading ? (\n            <div className="h-24 flex items-center justify-center border rounded-md text-muted-foreground">Loading report data...</div>\n          ) : (\n            <DataTable columns={columns} data={data} hideToolbar={true} />\n          )}'
);

fs.writeFileSync(file, content);
console.log("Done");
