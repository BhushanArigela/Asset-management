const fs = require('fs');
let content = fs.readFileSync('src/components/assets/asset-form.tsx', 'utf8');
content = content.replace(/className="([^"]*)pt-6([^"]*)"/g, 'className="$1pt-4$2"');
fs.writeFileSync('src/components/assets/asset-form.tsx', content);
