const fs = require('fs');
const file = 'src/app/(dashboard)/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /hover:bg-gray-50 w-full sm:w-auto/g,
  'hover:bg-gray-50 hover:text-gray-900 w-full sm:w-auto'
);

fs.writeFileSync(file, content);
console.log("Done");
