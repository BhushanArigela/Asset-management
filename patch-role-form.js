const fs = require('fs');
const file = 'src/components/roles/role-form-dialog.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. DialogContent
content = content.replace(
  /<DialogContent className="sm:max-w-\[950px\] p-0 overflow-hidden bg-\[#fafafa\]">/,
  '<DialogContent className="sm:max-w-[950px] p-0 overflow-hidden bg-[#fafafa] flex flex-col max-h-[95vh] md:max-h-[85vh]">'
);

// 2. Header div shrink-0
content = content.replace(
  /<div className="flex items-center justify-between p-6 bg-white border-b border-gray-100">/,
  '<div className="flex items-center justify-between p-6 bg-white border-b border-gray-100 shrink-0">'
);

// 3. form className
content = content.replace(
  /<form onSubmit=\{form\.handleSubmit\(onSubmit\)\}>/,
  '<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">'
);

// 4. body div flex-1
content = content.replace(
  /<div className="p-6 md:p-8 space-y-8 max-h-\[75vh\] overflow-y-auto">/,
  '<div className="p-6 md:p-8 space-y-8 flex-1 overflow-y-auto">'
);

// 5. bottom actions shrink-0
content = content.replace(
  /<div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-white">/,
  '<div className="flex items-center justify-end gap-3 p-5 border-t border-gray-100 bg-white shrink-0">'
);

fs.writeFileSync(file, content);
console.log("Done");
