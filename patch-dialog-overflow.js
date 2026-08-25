const fs = require('fs');
const file = 'src/components/ui/dialog.tsx';

let content = fs.readFileSync(file, 'utf8');

// The original class string inside DialogContent is:
// "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg"

content = content.replace(
  'sm:rounded-lg",',
  'sm:rounded-lg max-h-[90vh] overflow-y-auto",'
);

fs.writeFileSync(file, content);
console.log("Done");
