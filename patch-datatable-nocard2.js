const fs = require('fs');
const file = 'src/components/ui/data-table.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add noCard prop
content = content.replace(
  'hideToolbar?: boolean;\r\n}',
  'hideToolbar?: boolean;\r\n  noCard?: boolean;\r\n}'
).replace(
  'hideToolbar?: boolean;\n}',
  'hideToolbar?: boolean;\n  noCard?: boolean;\n}'
);

content = content.replace(
  'hideToolbar = false,\r\n}: DataTableProps<TData, TValue>) {',
  'hideToolbar = false,\r\n  noCard = false,\r\n}: DataTableProps<TData, TValue>) {'
).replace(
  'hideToolbar = false,\n}: DataTableProps<TData, TValue>) {',
  'hideToolbar = false,\n  noCard = false,\n}: DataTableProps<TData, TValue>) {'
);

const regex = /<Card>\r?\n\s*<CardContent className="p-6">([\s\S]*?)<\/CardContent>\r?\n\s*<\/Card>/;
const match = content.match(regex);

if (match) {
  const innerContent = match[1];
  const replacement = `
  const tableContent = (
    <>
      ${innerContent}
    </>
  );

  if (noCard) {
    return tableContent;
  }

  return (
    <Card>
      <CardContent className="p-6">
        {tableContent}
      </CardContent>
    </Card>
  );`;
  
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content);
  console.log("Done");
} else {
  console.log("Regex failed again");
}
