const fs = require('fs');
const file = 'src/components/ui/data-table.tsx';

let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  '{row.getIsExpanded() ? <MinusCircle className="w-4 h-4 text-[#ef4444] fill-[#fef2f2]" /> : <PlusCircle className="w-4 h-4 text-[#16a34a] fill-[#f0fdf4]" />}',
  '{row.getIsExpanded() ? <MinusCircle className="w-[18px] h-[18px] fill-[#ef4444] text-white border-none" /> : <PlusCircle className="w-[18px] h-[18px] fill-[#16a34a] text-white border-none" />}'
);

fs.writeFileSync(file, content);
console.log("Done");
