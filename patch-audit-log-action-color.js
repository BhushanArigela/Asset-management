const fs = require('fs');
const file = 'src/components/audit-logs/audit-log-page.tsx';
let content = fs.readFileSync(file, 'utf8');

const helperCode = `
const getActionColor = (action: string) => {
  switch (action?.toUpperCase()) {
    case "CREATE":
    case "LOGIN":
    case "SUCCESS":
      return "border-green-500 text-green-600";
    case "DELETE":
    case "FAIL":
    case "ERROR":
      return "border-red-500 text-red-600";
    case "UPDATE":
    case "EDIT":
      return "border-blue-500 text-blue-600";
    default:
      return "border-gray-500 text-gray-600";
  }
};
`;

content = content.replace(
  'export function AuditLogPage() {',
  helperCode + '\nexport function AuditLogPage() {'
);

fs.writeFileSync(file, content);
console.log("Done");
