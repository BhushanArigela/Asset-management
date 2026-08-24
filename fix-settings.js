const fs = require('fs');

const f = 'src/app/(dashboard)/settings/page.tsx';
let code = fs.readFileSync(f, 'utf8');

if (!code.includes('useSession')) {
  code = code.replace('\"use client\";', '\"use client\";\nimport { useSession } from \"next-auth/react\";\nimport { hasPermission, PERMISSIONS } from \"@/lib/permissions\";');
}

const fnMatch = code.match(/export default function SettingsPage\(\) \{/);
const componentStart = fnMatch[0];
if (!code.includes('const canEditSettings')) {
  code = code.replace(componentStart, componentStart + '\n  const { data: session } = useSession();\n  const canEditSettings = hasPermission(session?.user?.permissions, [PERMISSIONS.SETTINGS_EDIT] as any);\n');
}

// Disable the form/button or hide the button
// Hiding the button is easiest
const btn = '<Button type="submit" disabled={isLoading} className="w-full md:w-auto">';
const btnNew = '{canEditSettings && (<Button type="submit" disabled={isLoading} className="w-full md:w-auto">';
code = code.replace(btn, btnNew);

const btnEnd = 'Save Settings\n                        </>\n                      )\}\n                    </Button>';
const btnEndNew = 'Save Settings\n                        </>\n                      )\}\n                    </Button>)}';
code = code.replace(btnEnd, btnEndNew);

fs.writeFileSync(f, code);
