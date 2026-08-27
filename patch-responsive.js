const fs = require('fs');

function patchFile(file) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/md:table-cell/g, 'lg:table-cell');
    content = content.replace(/md:hidden/g, 'lg:hidden');
    fs.writeFileSync(file, content);
}

patchFile('src/components/assets/asset-list-page.tsx');
patchFile('src/components/audit-logs/audit-log-page.tsx');

console.log("Done");
