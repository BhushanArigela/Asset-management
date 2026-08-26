const fs = require('fs');
const file = 'src/components/assets/asset-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<Tabs defaultValue="overview" className="-y-3">/g,
  '<Tabs defaultValue="overview" className="space-y-4">'
);

fs.writeFileSync(file, content);
console.log("Done");
