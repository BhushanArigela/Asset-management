const fs = require('fs');
const file = 'src/components/layout/sidebar.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add open state
content = content.replace(
  /export function Sidebar\(\) \{/,
  'export function Sidebar() {\n  const [open, setOpen] = useState(false);'
);

// Add onClick to Link
content = content.replace(
  /<Link\s*\n\s*href=\{item\.href\}/g,
  '<Link\n                          href={item.href}\n                          onClick={() => setOpen(false)}'
);

// Add controlled props to Sheet
content = content.replace(
  /<Sheet>/g,
  '<Sheet open={open} onOpenChange={setOpen}>'
);

fs.writeFileSync(file, content);
console.log("Done");
