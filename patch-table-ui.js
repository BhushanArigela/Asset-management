const fs = require('fs');
const file = 'src/components/ui/table.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="relative w-full overflow-auto rounded-md border">',
  '<div className="relative w-full rounded-md border">'
);

fs.writeFileSync(file, content);
console.log("Done");
