const fs = require('fs');
let file = 'src/app/(dashboard)/settings/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Remove border-gray-200 from all Inputs
content = content.replace(/border-gray-200/g, 'border-input');

// 2. Change icon box borders to border-input so they match
content = content.replace(/border-\[#e1eafc\]/g, 'border-input');
content = content.replace(/border-purple-100/g, 'border-input');
content = content.replace(/border-emerald-100/g, 'border-input');
content = content.replace(/border-amber-100/g, 'border-input');

fs.writeFileSync(file, content);
console.log("Done");
