for file in ['src/components/users/user-list-page.tsx', 'src/components/roles/role-list-page.tsx']:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'import { DataTable }' not in content:
        content = content.replace('from "lucide-react";', 'from "lucide-react";\nimport { DataTable } from "@/components/ui/data-table";')
        
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)
