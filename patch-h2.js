const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

let count = 0;
walk('src', function(filePath) {
  if (filePath.endsWith('.tsx')) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if it has "text-3xl font-bold tracking-tight"
    if (content.includes('text-3xl font-bold tracking-tight')) {
      content = content.replace(/text-3xl font-bold tracking-tight/g, 'text-2xl font-bold tracking-tight');
      fs.writeFileSync(filePath, content);
      count++;
    }
  }
});

console.log(`Updated ${count} files.`);
