const fs = require('fs');
const file = 'src/app/(dashboard)/profile/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the mangled bullet characters with asterisks
content = content.replace(/placeholder="[?]+"|placeholder="[^"]*[^"]*"/g, 'placeholder="********"');

fs.writeFileSync(file, content);
console.log("Done");
