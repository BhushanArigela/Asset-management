const fs = require('fs');
const file = 'src/components/maintenance/maintenance-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="flex justify-between items-center bg-white p-6 rounded-lg shadow-sm border">',
  '<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-lg shadow-sm border">'
);

fs.writeFileSync(file, content);
console.log("Done");
