const fs = require('fs');
let content = fs.readFileSync('src/components/ui/button.tsx', 'utf8');
content = content.replace(/icon: "h-10 w-10"/g, 'icon: "h-7 w-7"');
fs.writeFileSync('src/components/ui/button.tsx', content);
