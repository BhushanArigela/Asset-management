import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuditLogPage } from "@/components/audit-logs/audit-log-page";

export const metadata = {
  title: "System Audit Logs | Sheraton Asset Management",
};

export default async function AuditLogsRoute() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">System Audit Logs</h2>
        <p className="text-muted-foreground">View and export chronological activity logs for the system.</p>
      </div>
      <AuditLogPage />
    </div>
  );
}
