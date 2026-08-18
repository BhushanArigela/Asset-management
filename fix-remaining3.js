const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  for (const [search, replace] of replacements) {
    content = content.replace(search, replace);
  }
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Fixed', filePath);
  }
}

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if(fs.statSync(dirPath).isDirectory()) walkDir(dirPath, callback);
    else callback(dirPath);
  });
}

// 1. Audit scannedAt
replaceInFile('./src/app/api/audits/[id]/scan/route.ts', [
  [/scannedById:\s*session\.user\.id,?/g, 'scannedById: session.user.id,\n        scannedAt: new Date(),']
]);

// 2. entityType in audits
walkDir('./src/app/api', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Fix entityType missing in logAudit
    content = content.replace(/await logAudit\(\{\s*(userId:|action:|module:|details:|entityId:|oldData:|newData:)/g, 'await logAudit({\n        entityType: "System",\n        $1');
    
    // Fix Argument of type 'string' is not assignable to parameter of type 'string[]' for permissions
    // Like hasPermission(user.permissions, PERMISSIONS.ASSETS_VIEW)
    content = content.replace(/hasPermission\(([^,]+),\s*([^)]+)\)/g, 'hasPermission($1, [$2] as any)');
    
    // Fix map does not exist
    content = content.replace(/\.map\(/g, '?.map(');

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed general', filePath);
    }
  }
});

replaceInFile('./src/app/api/maintenance/route.ts', [
  [/assignedTo:\s*true,?\n/g, '']
]);

replaceInFile('./src/app/api/maintenance/[id]/route.ts', [
  [/assignedTo:\s*true,?\n/g, '']
]);

replaceInFile('./src/app/api/assets/[id]/route.ts', [
  [/documents:\s*true,?\n/g, 'assetDocuments: true,\n']
]);
