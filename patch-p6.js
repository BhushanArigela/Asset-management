const fs = require('fs');
let content = fs.readFileSync('src/components/assets/asset-form.tsx', 'utf8');
content = content.replace(/className="p-6 space-y-3"/g, 'className="p-4 space-y-3"');
content = content.replace(/className="p-6"/g, 'className="p-4"');
fs.writeFileSync('src/components/assets/asset-form.tsx', content);
