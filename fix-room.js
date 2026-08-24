const fs = require('fs');

const f = 'src/components/masters/locations/room-tab.tsx';
let code = fs.readFileSync(f, 'utf8');

code = code.replace('\"use client\";', '\"use client\";\nimport { useSession } from \"next-auth/react\";\nimport { hasPermission, PERMISSIONS } from \"@/lib/permissions\";');

const fnMatch = code.match(/export function (\w+)\(\) \{/);
const componentStart = fnMatch[0];
code = code.replace(componentStart, componentStart + '\n  const { data: session } = useSession();\n  const canCreateMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_CREATE] as any);\n  const canEditMaster = hasPermission(session?.user?.permissions, [PERMISSIONS.MASTERS_EDIT] as any);\n');

// Specific replacement for Add button
const addBtnRegex = /<Button\s+className=\"bg-\[#1B2A4A\][^\"]*\"[^>]*>\s*<Plus[^>]*\/>[^<]+<\/Button>/g;
code = code.replace(addBtnRegex, match => '{canCreateMaster && (' + match + ')}');

// Regex for edit
code = code.replace(/<Button variant=\"ghost\" size=\"icon\" onClick=\{\(\) => \{\s*setSelectedRoom\(row.original\);\s*setIsDialogOpen\(true\);\s*\}\}>\s*<Edit className=\"h-4 w-4\" \/>\s*<\/Button>/g, match => '{canEditMaster && (' + match + ')}');

fs.writeFileSync(f, code);
