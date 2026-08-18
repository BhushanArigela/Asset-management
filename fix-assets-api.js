const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src/app/api/assets', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/PERMISSIONS\.CREATE_ASSET/g, 'PERMISSIONS.ASSETS_CREATE');
    content = content.replace(/PERMISSIONS\.VIEW_ASSET/g, 'PERMISSIONS.ASSETS_VIEW');
    content = content.replace(/PERMISSIONS\.EDIT_ASSET/g, 'PERMISSIONS.ASSETS_EDIT');
    content = content.replace(/PERMISSIONS\.DELETE_ASSET/g, 'PERMISSIONS.ASSETS_DELETE');
    
    content = content.replace(/AUDIT_MODULES\.ASSET\b/g, 'AUDIT_MODULES.ASSETS');
    content = content.replace(/recordId:/g, 'entityId:');
    content = content.replace(/error as z\.ZodError/g, 'error as any');
    
    if (filePath.includes('warranty') || filePath.includes('amc')) {
      content = content.replace(/providerName:/g, 'vendorId:');
      content = content.replace(/providerName\b/g, 'vendorId');
    }

    if (filePath.includes('[id]/route.ts')) {
      content = content.replace(/documents: true/g, 'assetDocuments: true');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed', filePath);
    }
  }
});
