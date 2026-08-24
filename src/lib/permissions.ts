// Permission module constants
export const MODULES = {
  USERS: "users",
  ROLES: "roles",
  MASTERS: "masters",
  ASSETS: "assets",
  MAINTENANCE: "maintenance",
  MOVEMENTS: "movements",
  WARRANTY: "warranty",
  REPORTS: "reports",
  AUDITS: "audits",
  AUDIT_LOGS: "audit_logs",
} as const;

// Permission action constants
export const ACTIONS = {
  VIEW: "view",
  CREATE: "create",
  EDIT: "edit",
  DELETE: "delete",
  IMPORT: "import",
  EXPORT: "export",
  EXECUTE: "execute",
  COMPLETE: "complete",
} as const;

// All permission definitions
export const PERMISSIONS = {
  // User Management
  USERS_VIEW: `${MODULES.USERS}.${ACTIONS.VIEW}`,
  USERS_CREATE: `${MODULES.USERS}.${ACTIONS.CREATE}`,
  USERS_EDIT: `${MODULES.USERS}.${ACTIONS.EDIT}`,
  USERS_DELETE: `${MODULES.USERS}.${ACTIONS.DELETE}`,

  // Role Management
  ROLES_VIEW: `${MODULES.ROLES}.${ACTIONS.VIEW}`,
  ROLES_CREATE: `${MODULES.ROLES}.${ACTIONS.CREATE}`,
  ROLES_EDIT: `${MODULES.ROLES}.${ACTIONS.EDIT}`,
  ROLES_DELETE: `${MODULES.ROLES}.${ACTIONS.DELETE}`,

  // Masters
  MASTERS_VIEW: `${MODULES.MASTERS}.${ACTIONS.VIEW}`,
  MASTERS_CREATE: `${MODULES.MASTERS}.${ACTIONS.CREATE}`,
  MASTERS_EDIT: `${MODULES.MASTERS}.${ACTIONS.EDIT}`,
  MASTERS_DELETE: `${MODULES.MASTERS}.${ACTIONS.DELETE}`,
  MASTER: `${MODULES.MASTERS}.${ACTIONS.VIEW}`, // Alias for generated code

  // Assets
  ASSETS_VIEW: `${MODULES.ASSETS}.${ACTIONS.VIEW}`,
  ASSETS_CREATE: `${MODULES.ASSETS}.${ACTIONS.CREATE}`,
  ASSETS_EDIT: `${MODULES.ASSETS}.${ACTIONS.EDIT}`,
  ASSETS_DELETE: `${MODULES.ASSETS}.${ACTIONS.DELETE}`,
  ASSETS_IMPORT: `${MODULES.ASSETS}.${ACTIONS.IMPORT}`,
  ASSETS_EXPORT: `${MODULES.ASSETS}.${ACTIONS.EXPORT}`,
  VIEW_ASSET: `${MODULES.ASSETS}.${ACTIONS.VIEW}`,
  CREATE_ASSET: `${MODULES.ASSETS}.${ACTIONS.CREATE}`,
  EDIT_ASSET: `${MODULES.ASSETS}.${ACTIONS.EDIT}`,
  DELETE_ASSET: `${MODULES.ASSETS}.${ACTIONS.DELETE}`,

  // Maintenance
  MAINTENANCE_VIEW: `${MODULES.MAINTENANCE}.${ACTIONS.VIEW}`,
  MAINTENANCE_CREATE: `${MODULES.MAINTENANCE}.${ACTIONS.CREATE}`,
  MAINTENANCE_EDIT: `${MODULES.MAINTENANCE}.${ACTIONS.EDIT}`,
  CREATE_MAINTENANCE: `${MODULES.MAINTENANCE}.${ACTIONS.CREATE}`,

  // Movements
  MOVEMENTS_VIEW: `${MODULES.MOVEMENTS}.${ACTIONS.VIEW}`,
  MOVEMENTS_CREATE: `${MODULES.MOVEMENTS}.${ACTIONS.CREATE}`,

  // Warranty
  WARRANTY_VIEW: `${MODULES.WARRANTY}.${ACTIONS.VIEW}`,
  WARRANTY_EDIT: `${MODULES.WARRANTY}.${ACTIONS.EDIT}`,

  // Reports
  REPORTS_VIEW: `${MODULES.REPORTS}.${ACTIONS.VIEW}`,
  REPORTS_EXPORT: `${MODULES.REPORTS}.${ACTIONS.EXPORT}`,

  // Audits
  AUDITS_VIEW: `${MODULES.AUDITS}.${ACTIONS.VIEW}`,
  AUDITS_CREATE: `${MODULES.AUDITS}.${ACTIONS.CREATE}`,
  AUDITS_EXECUTE: `${MODULES.AUDITS}.${ACTIONS.EXECUTE}`,
  AUDITS_COMPLETE: `${MODULES.AUDITS}.${ACTIONS.COMPLETE}`,

  // Audit Logs
  AUDIT_LOGS_VIEW: `${MODULES.AUDIT_LOGS}.${ACTIONS.VIEW}`,
  AUDIT_LOGS_EXPORT: `${MODULES.AUDIT_LOGS}.${ACTIONS.EXPORT}`,
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

// All permissions as array (for seeding)
export const ALL_PERMISSIONS: Array<{
  module: string;
  action: string;
  description: string;
}> = [
  // Users
  { module: MODULES.USERS, action: ACTIONS.VIEW, description: "View users" },
  { module: MODULES.USERS, action: ACTIONS.CREATE, description: "Create users" },
  { module: MODULES.USERS, action: ACTIONS.EDIT, description: "Edit users" },
  { module: MODULES.USERS, action: ACTIONS.DELETE, description: "Delete / deactivate users" },

  // Roles
  { module: MODULES.ROLES, action: ACTIONS.VIEW, description: "View roles" },
  { module: MODULES.ROLES, action: ACTIONS.CREATE, description: "Create roles" },
  { module: MODULES.ROLES, action: ACTIONS.EDIT, description: "Edit roles and permissions" },
  { module: MODULES.ROLES, action: ACTIONS.DELETE, description: "Delete / deactivate roles" },

  // Masters
  { module: MODULES.MASTERS, action: ACTIONS.VIEW, description: "View master data" },
  { module: MODULES.MASTERS, action: ACTIONS.CREATE, description: "Create master records" },
  { module: MODULES.MASTERS, action: ACTIONS.EDIT, description: "Edit master records" },
  { module: MODULES.MASTERS, action: ACTIONS.DELETE, description: "Delete / deactivate master records" },

  // Assets
  { module: MODULES.ASSETS, action: ACTIONS.VIEW, description: "View assets" },
  { module: MODULES.ASSETS, action: ACTIONS.CREATE, description: "Register new assets" },
  { module: MODULES.ASSETS, action: ACTIONS.EDIT, description: "Edit asset information" },
  { module: MODULES.ASSETS, action: ACTIONS.DELETE, description: "Delete assets" },
  { module: MODULES.ASSETS, action: ACTIONS.IMPORT, description: "Import assets from Excel" },
  { module: MODULES.ASSETS, action: ACTIONS.EXPORT, description: "Export assets to Excel" },

  // Maintenance
  { module: MODULES.MAINTENANCE, action: ACTIONS.VIEW, description: "View maintenance requests" },
  { module: MODULES.MAINTENANCE, action: ACTIONS.CREATE, description: "Create maintenance requests" },
  { module: MODULES.MAINTENANCE, action: ACTIONS.EDIT, description: "Update maintenance requests" },

  // Movements
  { module: MODULES.MOVEMENTS, action: ACTIONS.VIEW, description: "View asset movements" },
  { module: MODULES.MOVEMENTS, action: ACTIONS.CREATE, description: "Create asset transfers" },

  // Warranty
  { module: MODULES.WARRANTY, action: ACTIONS.VIEW, description: "View warranty information" },
  { module: MODULES.WARRANTY, action: ACTIONS.EDIT, description: "Manage warranty records" },

  // Reports
  { module: MODULES.REPORTS, action: ACTIONS.VIEW, description: "View reports" },
  { module: MODULES.REPORTS, action: ACTIONS.EXPORT, description: "Export reports" },

  // Audits
  { module: MODULES.AUDITS, action: ACTIONS.VIEW, description: "View audit sessions" },
  { module: MODULES.AUDITS, action: ACTIONS.CREATE, description: "Create audit sessions" },
  { module: MODULES.AUDITS, action: ACTIONS.EXECUTE, description: "Execute physical audits" },
  { module: MODULES.AUDITS, action: ACTIONS.COMPLETE, description: "Complete and lock audits" },

  // Audit Logs
  { module: MODULES.AUDIT_LOGS, action: ACTIONS.VIEW, description: "View system audit logs" },
  { module: MODULES.AUDIT_LOGS, action: ACTIONS.EXPORT, description: "Export audit logs" },
];

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userPermissions: string[] | undefined,
  permission: string | string[]
): boolean {
  if (!userPermissions) return false;
  if (Array.isArray(permission)) {
    return permission.some(p => userPermissions.includes(p));
  }
  return userPermissions.includes(permission);
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  userPermissions: string[] | undefined,
  permissions: string[]
): boolean {
  if (!userPermissions) return false;
  return permissions.some((p) => userPermissions.includes(p));
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
  userPermissions: string[] | undefined,
  permissions: string[]
): boolean {
  if (!userPermissions) return false;
  return permissions.every((p) => userPermissions.includes(p));
}

/**
 * Get module label for display
 */
export function getModuleLabel(module: string): string {
  const labels: Record<string, string> = {
    users: "User Management",
    roles: "Role Management",
    masters: "Master Data",
    assets: "Asset Management",
    maintenance: "Maintenance",
    movements: "Asset Movements",
    warranty: "Warranty",
    reports: "Reports",
    audits: "Asset Audits",
    audit_logs: "Audit Logs",
  };
  return labels[module] || module;
}

/**
 * Get action label for display
 */
export function getActionLabel(action: string): string {
  const labels: Record<string, string> = {
    view: "View",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    import: "Import",
    export: "Export",
    execute: "Execute",
    complete: "Complete",
  };
  return labels[action] || action;
}
