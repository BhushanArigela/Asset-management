import os
import glob
import re

files = glob.glob('src/components/masters/**/*-tab.tsx', recursive=True)
files.extend([
    'src/components/masters/vendors/vendor-list-page.tsx',
    'src/components/users/user-list-page.tsx',
    'src/components/roles/role-list-page.tsx'
])
    
for file in files:
    if not os.path.exists(file): continue
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if "DataTable" not in content:
        # Just prepend it after the last import
        import_stmt = '\nimport { DataTable } from "@/components/ui/data-table";\n'
        last_import = content.rfind('import ')
        if last_import != -1:
            end_of_import = content.find(';', last_import)
            if end_of_import != -1:
                content = content[:end_of_import+1] + import_stmt + content[end_of_import+1:]
        
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)

print(f"Fixed missing imports.")
