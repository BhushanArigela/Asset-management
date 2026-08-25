const fs = require('fs');
const file = 'src/components/audits/audit-list-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '<div className="flex gap-2 items-center">',
  '<div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center w-full">'
);

content = content.replace(
  'className="pl-8 w-[250px]"',
  'className="pl-8 w-full sm:w-[250px]"'
);

content = content.replace(
  '<div className="relative">',
  '<div className="relative w-full sm:w-auto">'
);

content = content.replace(
  '<SelectTrigger className="w-[180px]">',
  '<SelectTrigger className="w-full sm:w-[180px]">'
);

fs.writeFileSync(file, content);
console.log("Done");
