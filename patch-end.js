const fs = require('fs');
const file = 'src/components/ui/data-table.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(
  /Next\r?\n\s*<\/Button>\r?\n\s*<\/div>\r?\n\s*<\/div>/g,
  'Next\n          </Button>\n        </div>\n      </div>)}'
);
fs.writeFileSync(file, content);
console.log("Done");
