const fs = require('fs');

const f = 'src/components/roles/role-list-page.tsx';
let code = fs.readFileSync(f, 'utf8');

if (!code.includes('useSession')) {
  code = code.replace('\"use client\";', '\"use client\";\nimport { useSession } from \"next-auth/react\";\nimport { hasPermission, PERMISSIONS } from \"@/lib/permissions\";');
}

code = code.replace('import { Plus, Edit } from "lucide-react";', 'import { Plus, Edit, Trash } from "lucide-react";');

const fnMatch = code.match(/export function RoleListPage\(\) \{/);
const componentStart = fnMatch[0];
if (!code.includes('const canCreateRole')) {
  code = code.replace(componentStart, componentStart + '\n  const { data: session } = useSession();\n  const canCreateRole = hasPermission(session?.user?.permissions, [PERMISSIONS.ROLES_CREATE] as any);\n  const canEditRole = hasPermission(session?.user?.permissions, [PERMISSIONS.ROLES_EDIT] as any);\n  const canDeleteRole = hasPermission(session?.user?.permissions, [PERMISSIONS.ROLES_DELETE] as any);\n');
}

if (!code.includes('const handleDelete')) {
  const fetchRoles = '  const fetchRoles = async () => {';
  const handleDeleteStr = \  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to deactivate this role?")) return;
    try {
      const res = await fetch(\\\\/api/roles/\\\\, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete role");
      toast.success("Role deactivated successfully");
      fetchRoles();
    } catch (error: any) {
      toast.error(error.message || "Error deleting role");
    }
  };

\;
  code = code.replace(fetchRoles, handleDeleteStr + fetchRoles);
}

const addBtnRegex = /<Button\s+className=\"bg-\[#1B2A4A\][^\"]*\"[^>]*>\s*<Plus[^>]*\/>[^<]+<\/Button>/g;
code = code.replace(addBtnRegex, match => '{canCreateRole && (' + match + ')}');

const actionCellMatch = code.match(/cell: \(\{ row \}\) => \{\s*const role = row\.original;\s*return \(\s*<Button variant="ghost" className="h-8 w-8 p-0" onClick=\{\(\) => \{\s*setSelectedRole\(role\);\s*setIsDialogOpen\(true\);\s*\}\}>\s*<Edit className="h-4 w-4" \/>\s*<\/Button>\s*\);\s*\}/);
if (actionCellMatch) {
  const newCell = \cell: ({ row }) => {
        const role = row.original;
        return (
          <div className="flex gap-2">
            {canEditRole && (
              <Button variant="ghost" className="h-8 w-8 p-0" onClick={() => {
                setSelectedRole(role);
                setIsDialogOpen(true);
              }} title="Edit Role">
                <Edit className="h-4 w-4" />
              </Button>
            )}
            {canDeleteRole && role.isActive && (
              <Button variant="ghost" className="h-8 w-8 p-0 text-red-600 hover:text-red-700" onClick={() => handleDelete(role.id)} title="Deactivate Role">
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      }\;
  code = code.replace(actionCellMatch[0], newCell);
}

fs.writeFileSync(f, code);
