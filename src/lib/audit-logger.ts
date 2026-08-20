import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

interface AuditLogParams {
  userId?: string | null;
  module: string;
  entityType?: string;
  entityId?: string | null;
  recordId?: string | null; // Alias for entityId
  action: string;
  previousValue?: any;
  newValue?: any;
  oldData?: any; // Alias
  newData?: any; // Alias
  details?: any; // Alias for newValue or previousValue depending on context
  ipAddress?: string | null;
  userAgent?: string | null;
  remarks?: string | null;
}

/**
 * Create an audit log entry
 */
export async function createAuditLog(params: AuditLogParams): Promise<void> {
  try {
    let ip = params.ipAddress;
    let agent = params.userAgent;

    // Try to automatically get IP and UserAgent if not provided
    if (!ip || !agent) {
      try {
        const headersList = await headers();
        if (!ip) ip = headersList.get("x-forwarded-for") || headersList.get("x-real-ip") || "127.0.0.1";
        if (!agent) agent = headersList.get("user-agent");
      } catch (e) {
        // Ignored if headers() is called outside of request context
      }
    }

    await prisma.auditLog.create({
      data: {
        userId: params.userId ?? null,
        module: params.module,
        entityType: params.entityType ?? "System",
        entityId: params.entityId ?? params.recordId ?? null,
        action: params.action,
        previousValue: params.previousValue ? (params.previousValue as any) : params.oldData ? (params.oldData as any) : undefined,
        newValue: params.newValue ? (params.newValue as any) : params.details ? (params.details as any) : params.newData ? (params.newData as any) : undefined,
        ipAddress: ip ?? null,
        userAgent: agent ?? null,
        remarks: params.remarks ?? null,
      },
    });
  } catch (error) {
    // Audit log failures should not break the main operation
    console.error("Failed to create audit log:", error);
  }
}

/**
 * Helper to extract changed fields between two objects
 */
export function getChangedFields(
  previous: Record<string, unknown>,
  current: Record<string, unknown>
): { previousValue: Record<string, unknown>; newValue: Record<string, unknown> } {
  const previousValue: Record<string, unknown> = {};
  const newValue: Record<string, unknown> = {};

  const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);

  for (const key of allKeys) {
    // Skip internal fields
    if (["updatedAt", "createdAt", "passwordHash"].includes(key)) continue;

    const prevVal = previous[key];
    const currVal = current[key];

    if (JSON.stringify(prevVal) !== JSON.stringify(currVal)) {
      previousValue[key] = prevVal;
      newValue[key] = currVal;
    }
  }

  return { previousValue, newValue };
}

// Audit action constants
export const AUDIT_ACTIONS = {
  CREATE: "created",
  UPDATE: "updated",
  DELETE: "deleted",
  ACTIVATE: "activated",
  DEACTIVATE: "deactivated",
  ASSIGN: "assigned",
  TRANSFER: "transferred",
  STATUS_CHANGE: "status_changed",
  CONDITION_CHANGE: "condition_changed",
  DISPOSE: "disposed",
  IMPORT: "imported",
  LOGIN: "login",
  LOGIN_FAILED: "login_failed",
  LOGOUT: "logout",
} as const;

// Audit module constants
export const AUDIT_MODULES = {
  USERS: "users",
  ROLES: "roles",
  COMPANIES: "companies",
  BUILDINGS: "buildings",
  FLOORS: "floors",
  ROOMS: "rooms",
  DEPARTMENTS: "departments",
  CATEGORIES: "asset_categories",
  SUB_CATEGORIES: "asset_sub_categories",
  BRANDS: "brands",
  CONDITIONS: "asset_conditions",
  STATUSES: "asset_statuses",
  VENDORS: "vendors",
  ASSETS: "assets",
  MAINTENANCE: "maintenance",
  MOVEMENTS: "movements",
  WARRANTY: "warranty",
  AMC: "amc",
  DISPOSAL: "disposal",
  AUDITS: "audits",
  IMPORTS: "imports",
  AUTH: "auth",
  MASTER_DATA: "masters", // Alias
  ASSET: "assets", // Alias
} as const;
