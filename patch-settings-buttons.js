const fs = require('fs');
let file = 'src/app/(dashboard)/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the container div
content = content.replace(
  '<div className="flex items-center gap-4 pt-6">', 
  '<div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-6">'
);

// Replace the primary button class
content = content.replace(
  'className="bg-[#2563eb] hover:bg-blue-700 text-white px-6 py-6 rounded-[12px] font-semibold text-[15px]"',
  'className="bg-[#2563eb] hover:bg-blue-700 text-white px-6 py-6 rounded-[12px] font-semibold text-[15px] w-full sm:w-auto"'
);

// Replace the secondary button class
content = content.replace(
  'className="px-6 py-6 rounded-[12px] font-semibold text-[15px] border-input text-gray-800 bg-white hover:bg-gray-50"',
  'className="px-6 py-6 rounded-[12px] font-semibold text-[15px] border-input text-gray-800 bg-white hover:bg-gray-50 w-full sm:w-auto"'
);

fs.writeFileSync(file, content);
console.log("Done");
