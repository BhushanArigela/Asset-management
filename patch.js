const fs = require('fs');
let code = fs.readFileSync('src/components/assets/asset-detail-page.tsx', 'utf8');

// Replace card shadow and add text-sm to CardContent
code = code.replaceAll('<Card>', '<Card className="shadow-none border">');
code = code.replaceAll('<CardContent className="space-y-2">', '<CardContent className="space-y-2 text-sm">');
code = code.replaceAll('<CardContent className="space-y-4">', '<CardContent className="space-y-4 text-sm">');
code = code.replaceAll('<CardContent className="grid', '<CardContent className="text-sm grid');
// also some cards might just have <CardContent>
code = code.replaceAll('<CardContent>', '<CardContent className="text-sm">');
// wait, if we already replaced some, the last one might double up. Let's be careful.
// Let's use regex.
