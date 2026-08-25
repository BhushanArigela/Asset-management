const fs = require('fs');
const file = 'src/components/ui/data-table.tsx';

let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '{row.getIsExpanded() ? <MinusCircle className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}',
  '{row.getIsExpanded() ? <MinusCircle className="w-4 h-4 text-[#ef4444] fill-[#fef2f2]" /> : <PlusCircle className="w-4 h-4 text-[#16a34a] fill-[#f0fdf4]" />}'
);

content = content.replace(
  'className="md:hidden text-green-600 hover:text-green-700 focus:outline-none shrink-0"',
  'className="md:hidden focus:outline-none shrink-0"'
);

fs.writeFileSync(file, content);
console.log("Done");
