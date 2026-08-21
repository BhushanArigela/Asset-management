import glob

files = glob.glob('src/components/masters/**/*.tsx', recursive=True)

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '<div className="flex justify-end mb-4">' in content:
        content = content.replace('<div className="flex justify-end mb-4">', '<div className="absolute top-6 right-4 md:right-8">')
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'Fixed {file}')
