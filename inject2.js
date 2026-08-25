const fs = require('fs');

const file = 'src/components/assets/asset-list-page.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('setExpandedRows')) {
  content = content.replace(
    'export function AssetListPage() {',
    'export function AssetListPage() {\n  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});\n  const toggleRow = (id: string) => setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));'
  );
}
fs.writeFileSync(file, content);
console.log("Done inject2");
