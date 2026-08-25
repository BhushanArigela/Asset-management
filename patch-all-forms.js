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
      
      // In components that have forms, reduce space-y-6, space-y-4, gap-6, gap-4 to 3 if inside a form
      // Actually let's just use regex to find <form ... className="space-y-X">
      content = content.replace(/<form([^>]+)className="([^"]*)space-y-[4568]([^"]*)"/g, '<form="-y-3"');
      
      if (content !== original) {
        console.log('Patched form in ' + filePath);
        fs.writeFileSync(filePath, content);
      }
    }
  }
});
