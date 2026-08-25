const fs = require('fs');
const file = 'src/components/reports/report-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add DataTable import
if (!content.includes('DataTable')) {
  content = content.replace(
    'import { toast } from "sonner";',
    'import { toast } from "sonner";\nimport { DataTable } from "@/components/ui/data-table";'
  );
}

// 2. Fix the CardHeader for mobile
content = content.replace(
  '<CardHeader className="flex flex-row items-center justify-between">',
  '<CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">'
);

// 3. Replace the entire manual table rendering with DataTable
const tableStart = '<CardContent>\n            <div className="overflow-hidden">';
const tableEnd = '          </CardContent>';
const regex = /<CardContent>[\s\S]*?<\/div>\s*<\/CardContent>/;
content = content.replace(regex, '<CardContent>\n            <DataTable columns={columns} data={data} hideToolbar={true} />\n          </CardContent>');

fs.writeFileSync(file, content);
console.log("Done");
