const fs = require('fs');
const file = 'src/components/reports/report-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /hideToolbar=\{true\}/g,
  'hideToolbar={false}'
);

fs.writeFileSync(file, content);
console.log("Done");
