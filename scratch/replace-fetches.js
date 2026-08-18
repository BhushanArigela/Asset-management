const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      let content = fs.readFileSync(filePath, 'utf8');
      
      // We want to replace fetch('/api/...') and fetch(`/api/...`)
      // with a helper or just prefix with process.env.NEXT_PUBLIC_BASE_PATH || ""
      
      // A safe way: replace fetch('/api/ with fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/
      // and fetch(`/api/ with fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/
      
      let changed = false;
      
      // Replace fetch("/api/...
      if (content.includes('fetch("/api/')) {
        content = content.replace(/fetch\("\/api\//g, 'fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/');
        changed = true;
      }
      
      // Replace fetch('/api/...
      if (content.includes("fetch('/api/")) {
        content = content.replace(/fetch\('\/api\//g, 'fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/');
        changed = true;
      }

      // Replace fetch(`/api/...
      if (content.includes('fetch(`/api/')) {
        content = content.replace(/fetch\(`\/api\//g, 'fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/');
        changed = true;
      }
      
      if (changed) {
        // Fix trailing quotes if we replaced standard strings with template literals
        // If we replaced fetch("/api/foo") with fetch(`${...}/api/foo")
        // we need to fix the closing quote to `
        // Actually, regex replacement:
        // fetch('/api/foo') -> fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/foo`)
        content = content.replace(/fetch\(`\$\{process\.env\.NEXT_PUBLIC_BASE_PATH \|\| ""\}\/api\/([^'"`]+)['"]/g, 'fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/$1`');
        
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated", filePath);
      }
    }
  }
}

processDir(path.join(__dirname, '../src'));
console.log("Done.");
