const fs = require('fs');

const fixImports = (file) => {
  let content = fs.readFileSync(file, 'utf8');

  // Insert PlusCircle, MinusCircle if missing in lucide-react
  if (content.includes('lucide-react') && !content.includes('PlusCircle')) {
    content = content.replace(
      /from "lucide-react";/,
      ', PlusCircle, MinusCircle } from "lucide-react";'
    );
    // Cleanup any duplicate curly braces that might have formed
    content = content.replace(/}\s*, PlusCircle/, ', PlusCircle');
  }

  // Insert expandedRows state and toggleRow if missing
  if (content.includes('const [data, setData] = useState') && !content.includes('expandedRows')) {
     content = content.replace(
       'const [data, setData] = useState',
       'const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});\n  const toggleRow = (id: string) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));\n  const [data, setData] = useState'
     );
  }
  
  if (content.includes('const [audits, setAudits] = useState') && !content.includes('expandedRows')) {
     content = content.replace(
       'const [audits, setAudits] = useState',
       'const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});\n  const toggleRow = (id: string) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));\n  const [audits, setAudits] = useState'
     );
  }

  fs.writeFileSync(file, content);
}

fixImports('src/components/assets/asset-list-page.tsx');
fixImports('src/components/audits/audit-list-page.tsx');
console.log("Done");
