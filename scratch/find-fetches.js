const fs = require('fs');
const path = require('path');

function searchFiles(dir, regex) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      results = results.concat(searchFiles(filePath, regex));
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (regex.test(content)) {
        results.push(filePath);
      }
    }
  }
  return results;
}

const res = searchFiles(path.join(__dirname, '../src'), /fetch\(['"`]\/api\//);
console.log("Files with absolute fetch(/api/):", res.length);
if (res.length > 0) {
  console.log(res.join('\n'));
}
