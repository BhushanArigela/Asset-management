const fs = require('fs');
const file = 'src/components/ui/data-table.tsx';
let content = fs.readFileSync(file, 'utf8');

// Add noCard prop
content = content.replace(
  'hideToolbar?: boolean;\n}',
  'hideToolbar?: boolean;\n  noCard?: boolean;\n}'
);

content = content.replace(
  'hideToolbar = false,\n}: DataTableProps<TData, TValue>) {',
  'hideToolbar = false,\n  noCard = false,\n}: DataTableProps<TData, TValue>) {'
);

// Wrap content
const startSplit = '<Card>\n      <CardContent className="p-6">';
const endSplit = '    </CardContent>\n  </Card>';

if (content.includes(startSplit) && content.includes(endSplit)) {
  let inner = content.split(startSplit)[1];
  let innerContent = inner.split(endSplit)[0];
  
  const replacement = `const tableContent = (
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
  
  content = content.replace(startSplit + innerContent + endSplit, replacement);
  fs.writeFileSync(file, content);
  console.log("Done");
} else {
  console.log("Regex failed");
}
