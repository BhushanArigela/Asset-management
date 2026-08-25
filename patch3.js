const fs = require('fs');
let code = fs.readFileSync('src/components/assets/asset-detail-page.tsx', 'utf8');

code = code.replace(/<Button\s+variant="outline"\s+onClick=\{\(\) => router\.push\(\\/assets\/\$\{asset\.id\}\/edit\\)\}>/g, '<Button className="bg-blue-600 hover:bg-blue-700 text-white border-0" onClick={() => router.push(/assets/\/edit)}>');
code = code.replace(/<Button\s+variant="outline"\s+onClick=\{\(\) => router\.push\(\\/movements\/new\?assetId=\$\{asset\.id\}\\)\}>/g, '<Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0" onClick={() => router.push(/movements/new?assetId=\)}>');
code = code.replace(/<Button\s+variant="outline"\s+onClick=\{\(\) => router\.push\(\\/maintenance\/new\?assetId=\$\{asset\.id\}\\)\}>/g, '<Button className="bg-amber-500 hover:bg-amber-600 text-white border-0" onClick={() => router.push(/maintenance/new?assetId=\)}>');

// Fix Card borders
code = code.replace(/<Card>/g, '<Card className="shadow-none border">');
// Fix Font sizes
code = code.replace(/<CardContent className="space-y-2">/g, '<CardContent className="space-y-2 text-sm">');
code = code.replace(/<CardContent className="space-y-4">/g, '<CardContent className="space-y-4 text-sm">');
code = code.replace(/<CardContent className="grid/g, '<CardContent className="text-sm grid');

fs.writeFileSync('src/components/assets/asset-detail-page.tsx', code);
