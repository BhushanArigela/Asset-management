const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            results.push(file);
        }
    });
    return results;
}

const files = walk('src/app/api/masters').filter(f => f.endsWith('route.ts'));

files.forEach(f => {
  let code = fs.readFileSync(f, 'utf8');
  
  if (!code.includes('hasPermission')) {
    code = code.replace(/import \{ NextResponse \} from \"next\/server\";/g, 'import { NextResponse } from \"next/server\";\nimport { hasPermission, PERMISSIONS } from \"@/lib/permissions\";');
  }

  // POST
  const postMatch = code.match(/export async function POST\([^)]*\)\s*\{[\s\S]*?const session = await auth\(\);\s*if \(!session\?\.user\) \{\s*return new NextResponse\(\"Unauthorized\", \{ status: 401 \}\);\s*\}/);
  if (postMatch && !code.includes('PERMISSIONS.MASTERS_CREATE')) {
    code = code.replace(postMatch[0], postMatch[0] + '\n\n    if (!hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_CREATE] as any)) {\n      return new NextResponse("Forbidden", { status: 403 });\n    }');
  }

  // PUT
  const putMatch = code.match(/export async function PUT\([^)]*\)\s*\{[\s\S]*?const session = await auth\(\);\s*if \(!session\?\.user\) \{\s*return new NextResponse\(\"Unauthorized\", \{ status: 401 \}\);\s*\}/);
  if (putMatch && !code.includes('PERMISSIONS.MASTERS_EDIT')) {
    code = code.replace(putMatch[0], putMatch[0] + '\n\n    if (!hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_EDIT] as any)) {\n      return new NextResponse("Forbidden", { status: 403 });\n    }');
  }

  // PATCH (if any)
  const patchMatch = code.match(/export async function PATCH\([^)]*\)\s*\{[\s\S]*?const session = await auth\(\);\s*if \(!session\?\.user\) \{\s*return new NextResponse\(\"Unauthorized\", \{ status: 401 \}\);\s*\}/);
  if (patchMatch && !code.includes('PERMISSIONS.MASTERS_EDIT')) {
    code = code.replace(patchMatch[0], patchMatch[0] + '\n\n    if (!hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_EDIT] as any)) {\n      return new NextResponse("Forbidden", { status: 403 });\n    }');
  }

  // DELETE
  const delMatch = code.match(/export async function DELETE\([^)]*\)\s*\{[\s\S]*?const session = await auth\(\);\s*if \(!session\?\.user\) \{\s*return new NextResponse\(\"Unauthorized\", \{ status: 401 \}\);\s*\}/);
  if (delMatch && !code.includes('PERMISSIONS.MASTERS_DELETE')) {
    code = code.replace(delMatch[0], delMatch[0] + '\n\n    if (!hasPermission(session.user.permissions, [PERMISSIONS.MASTERS_DELETE] as any)) {\n      return new NextResponse("Forbidden", { status: 403 });\n    }');
  }

  fs.writeFileSync(f, code);
  console.log('Patched API', f);
});
