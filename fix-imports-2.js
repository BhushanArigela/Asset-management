const fs = require('fs');

const fixImports = (file, anchor) => {
  let content = fs.readFileSync(file, 'utf8');

  // Insert PlusCircle, MinusCircle
  if (content.includes('lucide-react') && !content.includes('PlusCircle')) {
    content = content.replace(
      '} from "lucide-react";',
      ', PlusCircle, MinusCircle } from "lucide-react";'
    );
  }

  // Insert state
  if (content.includes(anchor) && !content.includes('expandedRows')) {
     content = content.replace(
       anchor,
       `const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});\n  const toggleRow = (id: string) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));\n  ${anchor}`
     );
  }

  fs.writeFileSync(file, content);
}

fixImports('src/components/assets/asset-list-page.tsx', 'const [searchTerm, setSearchTerm] = useState("");');
fixImports('src/components/audits/audit-list-page.tsx', 'const [searchTerm, setSearchTerm] = useState("");');
console.log("Done");
