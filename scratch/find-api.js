const fs = require('fs');
const path = require('path');
function walk(dir) {
  let list = fs.readdirSync(dir);
  for (let f of list) {
    let p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      walk(p);
    } else if (f.endsWith('.tsx') || f.endsWith('.ts')) {
      let content = fs.readFileSync(p, 'utf8');
      // match any string literal starting with /api/
      if (/(['"`])\/api\//.test(content)) {
        // filter out files that only have it inside NEXT_PUBLIC_BASE_PATH replacements
        let lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          if (/(['"`])\/api\//.test(lines[i]) && !lines[i].includes('NEXT_PUBLIC_BASE_PATH') && !p.includes('route.ts') && !p.includes('auth.ts')) {
            console.log(p + ':' + (i + 1) + ' -> ' + lines[i].trim());
          }
        }
      }
    }
  }
}
walk('src');
