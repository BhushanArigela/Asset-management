const fs = require('fs');
const file = 'src/components/assets/asset-accessories-tab.tsx';
let content = fs.readFileSync(file, 'utf8');

// Fix the form spacing
content = content.replace(
  /<form onSubmit=\{handleSubmit\} className="-y-3">/g,
  '<form onSubmit={handleSubmit} className="space-y-4">'
);

// Fix the inner label spacing using the global .space-y-0 rule
content = content.replace(
  /<div className="space-y-2">\s*<Label>Name \/ Description<\/Label>/g,
  '<div className="space-y-0">\n                    <Label>Name / Description</Label>'
);

content = content.replace(
  /<div className="space-y-2">\s*<Label>Serial Number \(Optional\)<\/Label>/g,
  '<div className="space-y-0">\n                    <Label>Serial Number (Optional)</Label>'
);

// Fix the QR modal
content = content.replace(
  /<div className="-y-3">\s*<img/g,
  '<div className="flex flex-col items-center justify-center space-y-4">\n                <img'
);

fs.writeFileSync(file, content);
console.log("Done");
