const fs = require('fs');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes('src={asset.imageUrl}')) {
    content = content.replace(/src=\{asset\.imageUrl\}/g, 'src={asset.imageUrl ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${asset.imageUrl}` : undefined}');
    changed = true;
  }
  if (content.includes('src={asset.assetDocuments[0].filePath}')) {
    content = content.replace(/src=\{asset\.assetDocuments\[0\]\.filePath\}/g, 'src={asset.assetDocuments[0]?.filePath ? `${process.env.NEXT_PUBLIC_BASE_PATH || ""}${asset.assetDocuments[0].filePath}` : undefined}');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log("Fixed " + filePath);
  }
}

fixFile("src/components/assets/asset-list-page.tsx");
fixFile("src/components/assets/asset-detail-page.tsx");
fixFile("src/components/assets/asset-search.tsx");
