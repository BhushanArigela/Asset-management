const fs = require('fs');
const file = 'src/components/assets/import-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="max-h-[500px] overflow-auto">',
  '<div className="max-h-[500px]">'
);

fs.writeFileSync(file, content);
console.log("Done");
