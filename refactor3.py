import os
import re

for file in ['src/components/users/user-list-page.tsx', 'src/components/roles/role-list-page.tsx']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove old table import completely
    content = re.sub(r'import\s*\{[^}]*Table[^}]*\}\s*from\s*"@/components/ui/table";', '', content)
    
    # Add DataTable import
    if 'DataTable' not in content:
        content = content.replace('from "lucide-react";', 'from "lucide-react";\nimport { DataTable } from "@/components/ui/data-table";')
        
    # Simplify tanstack import
    content = re.sub(r'import\s*\{[^}]*useReactTable[^}]*\}\s*from\s*"@tanstack/react-table";', 'import { ColumnDef } from "@tanstack/react-table";', content)
    
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Fixed user and roles lists.")
