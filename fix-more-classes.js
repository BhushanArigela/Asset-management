const fs = require('fs');
const file = 'src/components/assets/asset-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /<TabsContent value="overview" className="-y-3">/g,
  '<TabsContent value="overview" className="space-y-3">'
);

content = content.replace(
  /<div className="-3">/g,
  '<div className="flex flex-col lg:flex-row gap-4">'
);

fs.writeFileSync(file, content);
console.log("Done");
