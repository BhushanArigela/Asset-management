const fs = require('fs');

let file;
let content;

// 1. data-table.tsx
file = 'src/components/ui/data-table.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<div className="rounded-md border">\s*<Table>/, '<div>\n        <Table>');
fs.writeFileSync(file, content);

// 2. audit-log-page.tsx
file = 'src/components/audit-logs/audit-log-page.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<div className="rounded-md border">\s*<Table>/, '<div>\n            <Table>');
fs.writeFileSync(file, content);

// 3. room-assets-modal.tsx
file = 'src/components/masters/locations/room-assets-modal.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<div className="flex-1 overflow-auto mt-4 border rounded-md">\s*<Table>/, '<div className="flex-1 overflow-auto mt-4">\n          <Table>');
fs.writeFileSync(file, content);

// 4. report-viewer.tsx
file = 'src/components/reports/report-viewer.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<div className="rounded-md border overflow-hidden">\s*<Table>/, '<div className="overflow-hidden">\n            <Table>');
fs.writeFileSync(file, content);

// 5. import-page.tsx
file = 'src/components/assets/import-page.tsx';
content = fs.readFileSync(file, 'utf8');
content = content.replace(/<div className="border rounded-md max-h-\[500px\] overflow-auto">\s*<Table>/, '<div className="max-h-[500px] overflow-auto">\n              <Table>');
fs.writeFileSync(file, content);

console.log("Done");
