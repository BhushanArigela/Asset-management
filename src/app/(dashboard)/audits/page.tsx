import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuditListPage } from "@/components/audits/audit-list-page";

export const metadata = {
  title: "Asset Audits | Sheraton Asset Management",
};

export default async function AuditsRoute() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Physical Audits</h2>
        <p className="text-muted-foreground">Manage and track physical verification of assets.</p>
      </div>
      <AuditListPage />
    </div>
  );
}
