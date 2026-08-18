const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Remove exactly: import { AUDIT_ACTIONS, AUDIT_MODULES, PERMISSIONS } from "@/lib/permissions";
    if (content.includes('import { AUDIT_ACTIONS, AUDIT_MODULES, PERMISSIONS } from "@/lib/permissions";')) {
      content = content.replace('import { AUDIT_ACTIONS, AUDIT_MODULES, PERMISSIONS } from "@/lib/permissions";\n', '');
      content = content.replace('import { AUDIT_ACTIONS, AUDIT_MODULES, PERMISSIONS } from "@/lib/permissions";\r\n', '');
      changed = true;
    }

    // 2. Remove exactly: import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";
    // ONLY IF createAuditLog... is already there
    if (content.includes('import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES }') && 
        content.includes('import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";')) {
      content = content.replace('import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";\n', '');
      content = content.replace('import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";\r\n', '');
      changed = true;
    }

    // 3. Remove exactly: import { PERMISSIONS } from "@/lib/permissions";
    // ONLY IF hasPermission, PERMISSIONS is already there
    if (content.includes('import { hasPermission, PERMISSIONS }') && 
        content.includes('import { PERMISSIONS } from "@/lib/permissions";')) {
      content = content.replace('import { PERMISSIONS } from "@/lib/permissions";\n', '');
      content = content.replace('import { PERMISSIONS } from "@/lib/permissions";\r\n', '');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
