const fs = require('fs');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = dir + '/' + f;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('src/components', function(filePath) {
  if (filePath.endsWith('.tsx') && !filePath.includes('ui/')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Pattern 1: row.original.isActive
    content = content.replace(/<Badge variant=\{row\.original\.isActive \? "default" : "destructive"\}>/g, '<Badge variant="outline" className={row.original.isActive ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}>');

    // Pattern 2: isActive
    content = content.replace(/<Badge variant=\{isActive \? "default" : "destructive"\}>/g, '<Badge variant="outline" className={isActive ? "border-green-500 text-green-600" : "border-red-500 text-red-600"}>');

    if (content !== original) {
      console.log('Patched badges in ' + filePath);
      fs.writeFileSync(filePath, content);
    }
  }
});

console.log("Done");
