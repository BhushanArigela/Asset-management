const fs = require('fs');
const file = 'src/components/assets/import-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<div className="flex items-center justify-between">/g,
  '<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">'
);

content = content.replace(
  /<div className="flex items-center gap-4">\s*<input/g,
  '<div className="flex flex-col sm:flex-row sm:items-center gap-4">\n                <input'
);

fs.writeFileSync(file, content);
console.log("Done");
