const fs = require('fs');
let code = fs.readFileSync('src/components/assets/asset-detail-page.tsx', 'utf8');

// Edit Button
code = code.replace(
  '<Button variant="outline" onClick={() => router.push(/assets/\/edit)}>',
  '<Button className="bg-blue-600 hover:bg-blue-700 text-white border-0" onClick={() => router.push(/assets/\/edit)}>'
);

// Transfer Button
code = code.replace(
  '<Button variant="outline" onClick={() => router.push(/movements/new?assetId=\)}>',
  '<Button className="bg-emerald-500 hover:bg-emerald-600 text-white border-0" onClick={() => router.push(/movements/new?assetId=\)}>'
);

// Maintenance Button
code = code.replace(
  '<Button variant="outline" onClick={() => router.push(/maintenance/new?assetId=\)}>',
  '<Button className="bg-amber-500 hover:bg-amber-600 text-white border-0" onClick={() => router.push(/maintenance/new?assetId=\)}>'
);

// Print QR Button
code = code.replace(
  '<Button variant="outline" onClick={() => setQrModalOpen(true)}>',
  '<Button className="bg-purple-600 hover:bg-purple-700 text-white border-0" onClick={() => setQrModalOpen(true)}>'
);

// Report Damage Button (Wait, it's orange in code, did the user change it? In first image there is no report damage. But let's leave it as is or change it if it has variant outline)
code = code.replace(
  '<Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700" onClick={() => setDamageOpen(true)}>',
  '<Button variant="outline" className="text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700" onClick={() => setDamageOpen(true)}>'
);

fs.writeFileSync('src/components/assets/asset-detail-page.tsx', code);
