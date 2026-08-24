const fs = require('fs');
const glob = require('glob');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/components/masters').filter(f => f.endsWith('.tsx') && !f.includes('form-dialog') && !f.includes('room-assets-modal.tsx'));

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  
  // Fix the invalid JSX expression
  code = code.replace(/cell:\s*\(\{\s*row\s*\}\)\s*=>\s*\(\s*\{canEditMaster/g, 'cell: ({ row }) => (<>{canEditMaster');
  code = code.replace(/<\/Button>\)}\s*\)\s*\}/g, '</Button>)}</>)\n    }');
  code = code.replace(/<\/Button>\)}\s*\)\s*$/gm, '</Button>)}</>)\n'); // Fallback if missing bracket

  // Wait, let's be more precise.
  // The original was cell: ({ row }) => ( ... )
  // We replaced the inside. We just need to replace cell: ({ row }) => ( with cell: ({ row }) => (<>
  // But some cells might have other things.
  // Since we only patched canEditMaster, we can just replace:
  // cell: ({ row }) => (\n        {canEditMaster with cell: ({ row }) => (<>\n        {canEditMaster
  
  fs.writeFileSync(f, code);
  console.log('Fixed syntax in', f);
});
