import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuditDetailPage } from "@/components/audits/audit-detail-page";

export const metadata = {
  title: "Audit Details | Sheraton Asset Management",
};

export default async function AuditDetailRoute(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <AuditDetailPage auditId={params.id} />
    </div>
  );
}
