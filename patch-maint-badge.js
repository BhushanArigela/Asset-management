const fs = require('fs');

let file = 'src/components/maintenance/maintenance-list-page.tsx';
let content = fs.readFileSync(file, 'utf8');

const getStatusColorCode = `
const getStatusColor = (status: string) => {
  switch (status) {
    case 'OPEN': return 'border-red-500 text-red-600';
    case 'IN_PROGRESS': return 'border-orange-500 text-orange-600';
    case 'RESOLVED': return 'border-green-500 text-green-600';
    case 'CLOSED': return 'border-gray-500 text-gray-600';
    default: return 'border-blue-500 text-blue-600';
  }
};
`;

if (!content.includes('getStatusColor')) {
  content = content.replace('export function MaintenanceListPage() {', getStatusColorCode + '\nexport function MaintenanceListPage() {');
}

content = content.replace(/<Badge>\{row\.original\.status\}<\/Badge>/g, '<Badge variant="outline" className={getStatusColor(row.original.status)}>{row.original.status}</Badge>');

fs.writeFileSync(file, content);
console.log("Done");
