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
      <AuditListPage />
    </div>
  );
}
