import os
import glob
import re

files = glob.glob('src/components/masters/**/*-tab.tsx', recursive=True)
files.append('src/components/masters/vendors/vendor-list-page.tsx')
if os.path.exists('src/components/users/user-list-page.tsx'):
    files.append('src/components/users/user-list-page.tsx')
if os.path.exists('src/components/roles/role-list-page.tsx'):
    files.append('src/components/roles/role-list-page.tsx')
if os.path.exists('src/components/reports/reports-page.tsx'):
    files.append('src/components/reports/reports-page.tsx')
    
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = re.sub(
        r'import \{ Table, TableBody, TableCell, TableHead, TableHeader, TableRow \} from "@/components/ui/table";',
        'import { DataTable } from "@/components/ui/data-table";',
        content
    )
    content = re.sub(
        r'import \{ ColumnDef, flexRender, getCoreRowModel, useReactTable \} from "@tanstack/react-table";',
        'import { ColumnDef } from "@tanstack/react-table";',
        content
    )
    content = re.sub(
        r'\s*const table = useReactTable\(\{ data, columns, getCoreRowModel: getCoreRowModel\(\) \}\);\n*',
        '\n\n',
        content
    )
    table_jsx_pattern = r'<div className="rounded-md border">\s*<Table>.*?</Table>\s*</div>'
    content = re.sub(
        table_jsx_pattern,
        '<DataTable columns={columns} data={data} />',
        content,
        flags=re.DOTALL
    )
    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print(f"Processed {len(files)} files.")
