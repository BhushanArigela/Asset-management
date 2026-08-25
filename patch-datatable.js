const fs = require('fs');
const file = 'src/components/ui/data-table.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Update interface
content = content.replace(
  'interface DataTableProps<TData, TValue> {\n  columns: ColumnDef<TData, TValue>[];\n  data: TData[];\n}',
  'interface DataTableProps<TData, TValue> {\n  columns: ColumnDef<TData, TValue>[];\n  data: TData[];\n  hideToolbar?: boolean;\n}'
);

// 2. Add hideToolbar to destructured props
content = content.replace(
  'export function DataTable<TData, TValue>({\n  columns,\n  data,\n}: DataTableProps<TData, TValue>) {',
  'export function DataTable<TData, TValue>({\n  columns,\n  data,\n  hideToolbar = false,\n}: DataTableProps<TData, TValue>) {'
);

// 3. Conditionally render the toolbar
// We have:
// <div className="flex items-center pb-4">
//   <div className="relative w-full max-w-sm">
//     <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
//     <Input
//       placeholder="Search..."
content = content.replace(
  '<div className="flex items-center pb-4">\n        <div className="relative w-full max-w-sm">',
  '{!hideToolbar && (<div className="flex items-center pb-4">\n        <div className="relative w-full max-w-sm">'
);
content = content.replace(
  'onChange={(event) => setGlobalFilter(String(event.target.value))}\n            className="pl-8"\n          />\n        </div>\n      </div>',
  'onChange={(event) => setGlobalFilter(String(event.target.value))}\n            className="pl-8"\n          />\n        </div>\n      </div>)}'
);

// 4. Conditionally render pagination
// <div className="flex items-center justify-end space-x-2 py-4">
//   <div className="flex-1 text-sm text-muted-foreground">
//     Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of {table.getFilteredRowModel().rows.length} entries
//   </div>
//   <Button
content = content.replace(
  '<div className="flex items-center justify-end space-x-2 py-4">',
  '{!hideToolbar && (<div className="flex items-center justify-end space-x-2 py-4">'
);
content = content.replace(
  'Next\n        </Button>\n      </div>',
  'Next\n        </Button>\n      </div>)}'
);

// 5. Update isMobileHidden
const oldIsMobileHidden = `const isMobileHidden = (index: number, total: number) => {
    // Keep first column (index 0) and last column (actions, index total - 1) visible.
    // Also keep second column if total > 3 to match screenshot format.
    if (index === 0) return false;
    if (index === total - 1) return false;
    if (index === 1 && total > 3) return false;
    return true;
  };`;

const newIsMobileHidden = `const isMobileHidden = (index: number, total: number) => {
    // Keep first column (index 0) and last column (actions, index total - 1) visible.
    if (index === 0) return false;
    if (index === total - 1) return false;
    return true;
  };`;
content = content.replace(oldIsMobileHidden, newIsMobileHidden);

fs.writeFileSync(file, content);
console.log("Done");
