const fs = require('fs');
const file = 'src/components/audit-logs/audit-log-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { Input } from "@/components/ui/input";',
  'import { Input } from "@/components/ui/input";\r\nimport { Badge } from "@/components/ui/badge";'
);

fs.writeFileSync(file, content);
console.log("Done");
