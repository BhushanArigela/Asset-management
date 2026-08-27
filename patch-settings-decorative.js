const fs = require('fs');
const file = 'src/app/(dashboard)/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /className="hidden md:block absolute right-12 top-1\/2 -translate-y-1\/2 opacity-90 z-0"/g,
  'className="hidden lg:block absolute right-12 top-1/2 -translate-y-1/2 opacity-90 z-0"'
);

fs.writeFileSync(file, content);
console.log("Done");
