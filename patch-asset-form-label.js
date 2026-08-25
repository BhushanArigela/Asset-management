const fs = require('fs');
let content = fs.readFileSync('src/components/assets/asset-form.tsx', 'utf8');
content = content.replace(/className="mb-2 block"/g, 'className="mb-1 block"');
fs.writeFileSync('src/components/assets/asset-form.tsx', content);
