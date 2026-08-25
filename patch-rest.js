const fs = require('fs');
['src/components/assets/asset-detail-page.tsx', 'src/components/assets/asset-accessories-tab.tsx'].forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/className="space-y-4"/g, 'className="space-y-3"');
    content = content.replace(/gap-4/g, 'gap-3');
    fs.writeFileSync(filePath, content);
});
