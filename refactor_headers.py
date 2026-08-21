import os
import glob
import re

files = glob.glob('src/components/**/*.tsx', recursive=True)
count = 0
for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if 'id: "actions"' in content and 'header: "Actions"' not in content:
        content = re.sub(r'id:\s*"actions",', 'id: "actions",\n      header: "Actions",', content)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed {file}')
        count += 1
print(f'Fixed {count} files')
