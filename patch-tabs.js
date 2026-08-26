const fs = require('fs');
const path = require('path');

const dir = 'src/components/masters/classifications/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('-tab.tsx'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(
        /<div className="absolute top-6 right-4 md:right-8">/g,
        '<div className="flex justify-end mb-4 md:absolute md:top-6 md:right-8 md:mb-0">'
    );
    fs.writeFileSync(filePath, content);
});
console.log("Done");
