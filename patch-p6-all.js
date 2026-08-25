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
      
      content = content.replace(/className="([^"]*)p-6([^"]*)"/g, 'className="$1p-4$2"');
      content = content.replace(/className="([^"]*)pt-6([^"]*)"/g, 'className="$1pt-4$2"');
      content = content.replace(/className="([^"]*)p-8([^"]*)"/g, 'className="$1p-4$2"');
      
      if (content !== original) {
        console.log('Patched p-6 in ' + filePath);
        fs.writeFileSync(filePath, content);
      }
    }
  }
});
