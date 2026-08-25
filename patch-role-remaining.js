const fs = require('fs');
let file = 'src/components/roles/role-form-dialog.tsx';

let content = fs.readFileSync(file, 'utf8');

// Update imports to include new icons
content = content.replace(
  'import { Shield, X, CheckSquare, Trash2, FileText, FileCheck, ShieldCheck, PenTool, Database, ChevronDown, ChevronUp, Save, User, Box, Info } from "lucide-react";',
  'import { Shield, X, CheckSquare, Trash2, FileText, FileCheck, ShieldCheck, PenTool, Database, ChevronDown, ChevronUp, Save, User, Box, Info, ArrowRightLeft, BarChart3, UserCog, Settings, Users } from "lucide-react";'
);

// Update getModuleIcon
const newGetModuleIcon = `const getModuleIcon = (module: string) => {
  const m = module.toUpperCase();
  if (m === "ASSETS") return <Box className="w-[20px] h-[20px] text-[#2563eb]" />;
  if (m === "AUDIT_LOGS") return <FileCheck className="w-[20px] h-[20px] text-[#16a34a]" />;
  if (m === "AUDITS") return <ShieldCheck className="w-[20px] h-[20px] text-[#9333ea]" />;
  if (m === "MAINTENANCE") return <PenTool className="w-[20px] h-[20px] text-[#ea580c]" />;
  if (m === "MASTERS") return <Database className="w-[20px] h-[20px] text-[#0891b2]" />;
  if (m === "MOVEMENTS") return <ArrowRightLeft className="w-[20px] h-[20px] text-[#d97706]" />;
  if (m === "REPORTS") return <BarChart3 className="w-[20px] h-[20px] text-[#4f46e5]" />;
  if (m === "ROLES") return <UserCog className="w-[20px] h-[20px] text-[#e11d48]" />;
  if (m === "SETTINGS") return <Settings className="w-[20px] h-[20px] text-[#0d9488]" />;
  if (m === "USERS") return <Users className="w-[20px] h-[20px] text-[#0ea5e9]" />;
  return <FileText className="w-[20px] h-[20px] text-gray-500" />;
};`;
content = content.replace(/const getModuleIcon = \([\s\S]*?\};\n/, newGetModuleIcon + '\n');

// Update getModuleBg
const newGetModuleBg = `const getModuleBg = (module: string) => {
  const m = module.toUpperCase();
  if (m === "ASSETS") return "bg-[#eff6ff]";
  if (m === "AUDIT_LOGS") return "bg-[#f0fdf4]";
  if (m === "AUDITS") return "bg-[#faf5ff]";
  if (m === "MAINTENANCE") return "bg-[#fff7ed]";
  if (m === "MASTERS") return "bg-[#ecfeff]";
  if (m === "MOVEMENTS") return "bg-[#fffbeb]";
  if (m === "REPORTS") return "bg-[#eef2ff]";
  if (m === "ROLES") return "bg-[#fff1f2]";
  if (m === "SETTINGS") return "bg-[#f0fdfa]";
  if (m === "USERS") return "bg-[#f0f9ff]";
  return "bg-gray-50";
};`;
content = content.replace(/const getModuleBg = \([\s\S]*?\};\n/, newGetModuleBg + '\n');

// Update getModuleColor
const newGetModuleColor = `const getModuleColor = (module: string) => {
  const m = module.toUpperCase();
  if (m === "ASSETS") return "text-[#2563eb] bg-[#eff6ff]";
  if (m === "AUDIT_LOGS") return "text-[#16a34a] bg-[#f0fdf4]";
  if (m === "AUDITS") return "text-[#9333ea] bg-[#faf5ff]";
  if (m === "MAINTENANCE") return "text-[#ea580c] bg-[#fff7ed]";
  if (m === "MASTERS") return "text-[#0891b2] bg-[#ecfeff]";
  if (m === "MOVEMENTS") return "text-[#d97706] bg-[#fffbeb]";
  if (m === "REPORTS") return "text-[#4f46e5] bg-[#eef2ff]";
  if (m === "ROLES") return "text-[#e11d48] bg-[#fff1f2]";
  if (m === "SETTINGS") return "text-[#0d9488] bg-[#f0fdfa]";
  if (m === "USERS") return "text-[#0ea5e9] bg-[#f0f9ff]";
  return "text-gray-600 bg-gray-100";
};`;
content = content.replace(/const getModuleColor = \([\s\S]*?\};\n/, newGetModuleColor + '\n');

// Update getModuleDescription
const newGetModuleDescription = `const getModuleDescription = (module: string) => {
  const m = module.toUpperCase();
  if (m === "ASSETS") return "Manage organizational assets";
  if (m === "AUDIT_LOGS") return "View and export audit logs";
  if (m === "AUDITS") return "Manage audit activities and results";
  if (m === "MAINTENANCE") return "Create and manage maintenance requests";
  if (m === "MASTERS") return "Manage master data and configurations";
  if (m === "MOVEMENTS") return "Manage asset transfers and allocations";
  if (m === "REPORTS") return "Generate and export system reports";
  if (m === "ROLES") return "Configure system roles and permissions";
  if (m === "SETTINGS") return "Manage global system configurations";
  if (m === "USERS") return "Manage user accounts and access";
  return "Configure module permissions";
};`;
content = content.replace(/const getModuleDescription = \([\s\S]*?\};\n/, newGetModuleDescription + '\n');


fs.writeFileSync(file, content);
console.log("Done");
