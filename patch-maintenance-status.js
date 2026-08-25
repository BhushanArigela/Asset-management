const fs = require('fs');

const patchFile = (file) => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(
    "case 'RESOLVED': return 'border-green-500 text-green-600';",
    "case 'RESOLVED': return 'border-green-500 text-green-600';\n    case 'COMPLETED': return 'border-green-500 text-green-600';"
  );
  fs.writeFileSync(file, content);
};

patchFile('src/components/maintenance/maintenance-list-page.tsx');
patchFile('src/components/maintenance/maintenance-detail-page.tsx');

console.log("Done");
