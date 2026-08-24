const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/components/masters').filter(f => f.endsWith('.tsx') && !f.includes('form-dialog') && !f.includes('room-assets-modal.tsx'));

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  
  if (!code.includes('useSession')) {
    code = code.replace('\"use client\";', '\"use client\";\nimport { useSession } from \"next-auth/react\";\nimport { hasPermission, PERMISSIONS } from \"@/lib/permissions\";');
  }
  
  const fnMatch = code.match(/export function (\w+)\(\) \{/);
  if (fnMatch) {
    const componentStart = fnMatch[0];
    if (!code.includes('const canCreateMaster')) {
      code = code.replace(componentStart, componentStart + '\n  const { data: session } = useSession();\n  const canCreateMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_CREATE] as any);\n  const canEditMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_EDIT] as any);\n');
    }
  }

  // Replace Edit button
  const editBtnRegex = /<Button variant="ghost" size="icon" onClick=\{[\s\S]*?\}\s*>\s*<Edit className="[\s\S]*?" \/>\s*<\/Button>/g;
  code = code.replace(editBtnRegex, match => '{canEditMaster && (' + match + ')}');

  // Replace Add button
  const addBtnRegex = /<Button\s+className="bg-\[#1B2A4A\][\s\S]*?">\s*<Plus[\s\S]*?\/>[\s\S]*?<\/Button>/g;
  code = code.replace(addBtnRegex, match => '{canCreateMaster && (' + match + ')}');

  fs.writeFileSync(f, code);
  console.log('Patched UI', f);
});
