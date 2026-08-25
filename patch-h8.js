const fs = require('fs');

['src/components/assets/asset-list-page.tsx', 'src/components/roles/role-list-page.tsx', 'src/components/users/user-list-page.tsx', 'src/components/audits/audit-list-page.tsx', 'src/components/maintenance/maintenance-list-page.tsx', 'src/components/movements/movement-list-page.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/className="h-8 w-8 p-0"/g, 'className="h-7 w-7 p-0"');
    fs.writeFileSync(file, content);
  }
});
