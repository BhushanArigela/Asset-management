const fs = require('fs');
const file = 'src/components/assets/asset-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// The main wrapper missing its "space" prefix
content = content.replace(
  /<div className="-y-3">/g,
  '<div className="space-y-6">'
);

fs.writeFileSync(file, content);
console.log("Done");
