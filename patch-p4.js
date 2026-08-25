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
    if (content.includes('<form ')) {
      let original = content;
      
      content = content.replace(/className="([^"]*)p-4([^"]*)"/g, 'className="$1p-3$2"');
      content = content.replace(/className="([^"]*)pt-4([^"]*)"/g, 'className="$1pt-3$2"');
      content = content.replace(/className="([^"]*)py-4([^"]*)"/g, 'className="$1py-2$2"');
      
      if (content !== original) {
        console.log('Patched p-4 to p-3 in ' + filePath);
        fs.writeFileSync(filePath, content);
      }
    }
  }
});
