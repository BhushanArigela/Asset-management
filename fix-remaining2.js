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

// 1. Audit scannedAt
replaceInFile('./src/app/api/audits/[id]/complete/route.ts', [
  [/scannedById: string;/g, 'scannedById: string; scannedAt?: Date;'],
  [/assetId: string,/g, 'assetId: string, scannedAt: Date,'],
  [/scannedById: session\.user\.id/g, 'scannedById: session.user.id,\n      scannedAt: new Date()']
]);

replaceInFile('./src/app/api/audits/[id]/scan/route.ts', [
  [/scannedById: session\.user\.id,/g, 'scannedById: session.user.id,\n        scannedAt: new Date(),']
]);

// 2. Masters Permissions
function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    if(fs.statSync(dirPath).isDirectory()) walkDir(dirPath, callback);
    else callback(dirPath);
  });
}

walkDir('./src/app/api/masters', (filePath) => {
  if (filePath.endsWith('.ts')) {
    replaceInFile(filePath, [
      [/PERMISSIONS\.MASTER\.READ/g, 'PERMISSIONS.MASTERS_VIEW'],
      [/PERMISSIONS\.MASTER\.UPDATE/g, 'PERMISSIONS.MASTERS_EDIT'],
      [/PERMISSIONS\.MASTER\.DELETE/g, 'PERMISSIONS.MASTERS_DELETE'],
      [/PERMISSIONS\.MASTER\.CREATE/g, 'PERMISSIONS.MASTERS_CREATE'],
      [/module: "masters",/g, 'module: "masters",\n        entityType: "Master Data",']
    ]);
  }
});

// 3. Asset movements
replaceInFile('./src/app/api/assets/[id]/movements/route.ts', [
  [/userId: session\.user\.id/g, 'createdById: session.user.id']
]);
