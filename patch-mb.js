const fs = require('fs');
let content = fs.readFileSync('src/components/assets/asset-form.tsx', 'utf8');
content = content.replace(/className="mb-1 block"/g, 'className="block"');
fs.writeFileSync('src/components/assets/asset-form.tsx', content);
