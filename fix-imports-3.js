const fs = require('fs');
const file = 'src/components/assets/asset-list-page.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('PlusCircle')) {
  content = content.replace(/}\s*from\s*"lucide-react";/, ', PlusCircle, MinusCircle } from "lucide-react";');
}
fs.writeFileSync(file, content);
console.log("Done");
