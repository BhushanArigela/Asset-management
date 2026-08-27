const fs = require('fs');
const file = 'src/app/(dashboard)/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Revert image visibility
content = content.replace(
  /className="hidden lg:block absolute right-12 top-1\/2 -translate-y-1\/2 opacity-90 z-0"/g,
  'className="hidden md:block absolute right-12 top-1/2 -translate-y-1/2 opacity-90 z-0"'
);

// Constrain text on tablet
content = content.replace(
  /<p className="text-\[14px\] text-gray-600 max-w-lg">/g,
  '<p className="text-[14px] text-gray-600 max-w-[280px] sm:max-w-sm md:max-w-[340px] lg:max-w-lg">'
);

fs.writeFileSync(file, content);
console.log("Done");
