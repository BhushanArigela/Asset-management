const fs = require('fs');
const path = require('path');

const filesToFix = [
  "src/components/assets/asset-form.tsx",
  "src/components/assets/asset-list-page.tsx",
  "src/components/assets/import-page.tsx",
  "src/components/audit-logs/audit-log-page.tsx",
  "src/components/masters/classifications/brand-form-dialog.tsx",
  "src/components/masters/classifications/category-form-dialog.tsx",
  "src/components/masters/classifications/condition-form-dialog.tsx",
  "src/components/masters/classifications/status-form-dialog.tsx",
  "src/components/masters/classifications/sub-category-form-dialog.tsx",
  "src/components/masters/locations/building-form-dialog.tsx",
  "src/components/masters/locations/company-form-dialog.tsx",
  "src/components/masters/locations/department-form-dialog.tsx",
  "src/components/masters/locations/floor-form-dialog.tsx",
  "src/components/masters/locations/room-form-dialog.tsx",
  "src/components/masters/vendors/vendor-form-dialog.tsx",
  "src/components/reports/report-viewer.tsx",
  "src/components/roles/role-form-dialog.tsx",
  "src/components/users/user-form-dialog.tsx",
];

for (let file of filesToFix) {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace "/api/ or '/api/
  content = content.replace(/(["'])\/api\//g, '(process.env.NEXT_PUBLIC_BASE_PATH || "") + $1/api/');
  
  // Replace `/api/
  content = content.replace(/`\/api\//g, '`${process.env.NEXT_PUBLIC_BASE_PATH || ""}/api/');
  
  fs.writeFileSync(file, content);
  console.log("Fixed: " + file);
}
