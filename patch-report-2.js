const fs = require('fs');
const file = 'src/components/reports/report-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add DataTable import
if (!content.includes('DataTable')) {
  content = content.replace(
    'import { toast } from "sonner";',
    'import { toast } from "sonner";\nimport { DataTable } from "@/components/ui/data-table";'
  );
}

// Fix the CardHeader for mobile
content = content.replace(
  '<CardHeader className="flex flex-row items-center justify-between">',
  '<CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">'
);

// Replace the table
const tableStart = '<CardContent>\r\n          <div className="overflow-hidden">';
const regex = /<CardContent>\r?\n\s*<div className="overflow-hidden">[\s\S]*?<\/Table>\r?\n\s*<\/div>\r?\n\s*<div className="flex items-center justify-between py-4">[\s\S]*?<\/div>\r?\n\s*<\/div>\r?\n\s*<\/CardContent>/;

if(regex.test(content)) {
  content = content.replace(regex, '<CardContent>\n          <DataTable columns={columns} data={data} hideToolbar={true} />\n        </CardContent>');
} else {
  console.log("REGEX FAILED");
}

fs.writeFileSync(file, content);
console.log("Done");
