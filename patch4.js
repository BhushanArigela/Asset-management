const fs = require('fs');
let code = fs.readFileSync('src/components/assets/asset-detail-page.tsx', 'utf8');

// Fix Card borders
code = code.replace(/<Card>/g, '<Card className="shadow-none border">');
// Fix Font sizes
code = code.replace(/<CardContent className="space-y-2">/g, '<CardContent className="space-y-2 text-sm">');
code = code.replace(/<CardContent className="space-y-4">/g, '<CardContent className="space-y-4 text-sm">');
code = code.replace(/<CardContent className="grid/g, '<CardContent className="text-sm grid');
// Fix CardContent without classes
code = code.replace(/<CardContent>/g, '<CardContent className="text-sm">');

fs.writeFileSync('src/components/assets/asset-detail-page.tsx', code);
