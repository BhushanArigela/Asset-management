const fs = require('fs');
const file = 'src/components/audits/audit-detail-page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { Play, CheckCircle, Lock, Camera, AlertTriangle, FileText } from "lucide-react";',
  'import { Play, CheckCircle, Lock, Camera, AlertTriangle, FileText, PlusCircle, MinusCircle } from "lucide-react";'
);

fs.writeFileSync(file, content);
console.log("Done");
