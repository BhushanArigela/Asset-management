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
      
      content = content.replace(/className="([^"]*)space-y-[4568]([^"]*)"/g, 'className="$1space-y-3$2"');
      content = content.replace(/className="([^"]*)gap-[4568]([^"]*)"/g, 'className="$1gap-3$2"');
      
      if (content !== original) {
        console.log('Patched form in ' + filePath);
        fs.writeFileSync(filePath, content);
      }
    }
  }
});
