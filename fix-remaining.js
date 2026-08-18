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

// Fix audits
const completeRoute = './src/app/api/audits/[id]/complete/route.ts';
replaceInFile(completeRoute, [
  [/expectedAssets: /g, 'auditExpectedAssets: '],
  [/results: /g, 'auditResults: '],
  [/\.expectedAssets/g, '.auditExpectedAssets'],
  [/\.results/g, '.auditResults'],
  [/ea: any/g, 'ea: any'],
  [/r: any/g, 'r: any']
]);
// also fix ts7006 implicit any for r, ea, assetId in complete route
replaceInFile(completeRoute, [
  [/\(r\)/g, '(r: any)'],
  [/\(ea\)/g, '(ea: any)'],
  [/\(assetId\)/g, '(assetId: string)']
]);

const auditRoute = './src/app/api/audits/[id]/route.ts';
replaceInFile(auditRoute, [
  [/expectedAssets:/g, 'auditExpectedAssets:'],
  [/results:/g, 'auditResults:']
]);

const scanRoute = './src/app/api/audits/[id]/scan/route.ts';
replaceInFile(scanRoute, [
  [/scannedById: session\.user\.id,/g, 'scannedById: session.user.id,\n        scannedAt: new Date(),']
]);

// Fix dashboard
const dashboardRoute = './src/app/api/dashboard/route.ts';
replaceInFile(dashboardRoute, [
  [/prisma\.category\./g, 'prisma.assetCategory.'],
  [/\(cat\)/g, '(cat: any)']
]);

// Fix maintenance
const maintIdRoute = './src/app/api/maintenance/[id]/route.ts';
replaceInFile(maintIdRoute, [
  [/reportedBy/g, 'createdBy'],
  [/assignedTo: true,/g, ''],
  [/EDIT_MAINTENANCE/g, 'MAINTENANCE_EDIT']
]);

const maintRoute = './src/app/api/maintenance/route.ts';
replaceInFile(maintRoute, [
  [/reportedBy/g, 'createdBy'],
  [/assignedTo: true,/g, ''],
  [/VIEW_MAINTENANCE/g, 'MAINTENANCE_VIEW'],
  [/assetId: data\.assetId,/g, 'requestNumber: `MR-${new Date().toISOString().slice(0,10).replace(/-/g, "")}-${Math.floor(Math.random() * 10000)}`,\n        assetId: data.assetId,']
]);

console.log('Patch complete.');
