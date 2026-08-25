const fs = require('fs');
const glob = require('glob'); // Not available by default, let's just use a recursive walk

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = dir + '/' + f;
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(dirPath);
  });
}

walk('src/components', function(filePath) {
  if (filePath.endsWith('.tsx') && filePath.includes('form')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // In forms, change space-y-6 to space-y-3
    content = content.replace(/className="space-y-6"/g, 'className="space-y-3"');
    // Change space-y-4 to space-y-3
    content = content.replace(/className="space-y-4"/g, 'className="space-y-3"');
    // Change gap-4 to gap-3
    content = content.replace(/gap-4/g, 'gap-3');
    // Change gap-6 to gap-3
    content = content.replace(/gap-6/g, 'gap-3');

    if (content !== original) {
      console.log('Patched ' + filePath);
      fs.writeFileSync(filePath, content);
    }
  }
});
