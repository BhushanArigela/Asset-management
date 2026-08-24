const fs = require('fs');

const f = 'src/components/users/user-list-page.tsx';
let code = fs.readFileSync(f, 'utf8');

if (!code.includes('useSession')) {
  code = code.replace('\"use client\";', '\"use client\";\nimport { useSession } from \"next-auth/react\";\nimport { hasPermission, PERMISSIONS } from \"@/lib/permissions\";');
}

const fnMatch = code.match(/export function UserListPage\(\) \{/);
const componentStart = fnMatch[0];
if (!code.includes('const canCreateUser')) {
  code = code.replace(componentStart, componentStart + '\n  const { data: session } = useSession();\n  const canCreateUser = hasPermission(session?.user?.permissions, [PERMISSIONS.USERS_CREATE] as any);\n  const canEditUser = hasPermission(session?.user?.permissions, [PERMISSIONS.USERS_EDIT] as any);\n  const canDeleteUser = hasPermission(session?.user?.permissions, [PERMISSIONS.USERS_DELETE] as any);\n');
}

// Add Button
const addBtnRegex = /<Button\s+className=\"bg-\[#1B2A4A\][^\"]*\"[^>]*>\s*<Plus[^>]*\/>[^<]+<\/Button>/g;
code = code.replace(addBtnRegex, match => '{canCreateUser && (' + match + ')}');

fs.writeFileSync(f, code);
