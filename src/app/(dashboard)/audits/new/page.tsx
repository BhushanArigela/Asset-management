import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuditForm } from "@/components/audits/audit-form";

export const metadata = {
  title: "New Audit | Sheraton Asset Management",
};

export default async function NewAuditRoute() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Create Audit Session</h2>
      </div>
      <AuditForm userId={session.user.id} />
    </div>
  );
}
