const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

walkDir('./src/app/api', (filePath) => {
  if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Replace @/lib/constants import with nothing if hasPermission is there, or add PERMISSIONS to @/lib/permissions
    if (content.includes('@/lib/constants')) {
      content = content.replace(/import\s+\{[^}]*\}\s+from\s+['"]@\/lib\/constants['"];?/g, '');
      
      // Ensure AUDIT_ACTIONS, AUDIT_MODULES are in @/lib/audit-logger
      if (content.includes('import { createAuditLog } from "@/lib/audit-logger"')) {
        content = content.replace('import { createAuditLog } from "@/lib/audit-logger"', 'import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger"');
      } else if (!content.includes('import { createAuditLog, AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger"')) {
        content = 'import { AUDIT_ACTIONS, AUDIT_MODULES } from "@/lib/audit-logger";\n' + content;
      }

      // Ensure PERMISSIONS is in @/lib/permissions
      if (content.includes('import { hasPermission } from "@/lib/permissions"')) {
        content = content.replace('import { hasPermission } from "@/lib/permissions"', 'import { hasPermission, PERMISSIONS } from "@/lib/permissions"');
      } else if (!content.includes('import { hasPermission, PERMISSIONS } from "@/lib/permissions"')) {
        content = 'import { PERMISSIONS } from "@/lib/permissions";\n' + content;
      }

      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Fixed:', filePath);
    }
  }
});
