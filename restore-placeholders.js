const fs = require('fs');
const file = 'src/app/(dashboard)/profile/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<Input placeholder="\*\*\*\*\*\*\*\*" className="pl-14 h-11 border-gray-200" \{\.\.\.field\} \/>/, '<Input placeholder="Admin" className="pl-14 h-11 border-gray-200" {...field} />');
content = content.replace(/<Input placeholder="\*\*\*\*\*\*\*\*" className="pl-14 h-11 border-gray-200" \{\.\.\.field\} \/>/, '<Input placeholder="1234567891" className="pl-14 h-11 border-gray-200" {...field} />');

fs.writeFileSync(file, content);
console.log("Done");
