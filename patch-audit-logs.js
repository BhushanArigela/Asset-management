const fs = require('fs');
const file = 'src/components/audit-logs/audit-log-page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Module cell
content = content.replace(
  /<TableCell>\s*<span className="px-2 py-1 bg-slate-100 text-xs font-semibold rounded-md">/g,
  '<TableCell className="hidden md:table-cell">\n                            <span className="px-2 py-1 bg-slate-100 text-xs font-semibold rounded-md">'
);

// Action cell
content = content.replace(
  /<TableCell>\s*<span className={`px-2 py-1 text-xs font-bold/g,
  '<TableCell className="hidden md:table-cell">\n                            <span className={`px-2 py-1 text-xs font-bold'
);

// Entity cell
content = content.replace(
  /<TableCell>\{\s*\(\(\) => \{/g,
  '<TableCell className="hidden md:table-cell">{\n                            (() => {'
);


fs.writeFileSync(file, content);
console.log("Done");
