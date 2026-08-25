const fs = require('fs');
const file = 'src/components/reports/report-viewer.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /<CardTitle className="text-xl capitalize flex items-center gap-2">[\s\S]*?<\/CardTitle>/;

const replacement = `<div className="flex flex-col gap-1">
            <CardTitle className="text-xl capitalize flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#C5A55A]" /> 
              {type.replace(/-/g, " ")} Report
            </CardTitle>
            <span className="text-sm font-normal text-muted-foreground ml-7">({data.length} Records)</span>
          </div>`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Done");
} else {
  console.log("Regex failed");
}
