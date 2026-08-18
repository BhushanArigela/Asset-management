import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuditScanner } from "@/components/audits/audit-scanner";

export const metadata = {
  title: "Audit Scanner | Sheraton Asset Management",
};

export default async function AuditScannerPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Asset Scanner</h2>
        <p className="text-muted-foreground">Session ID: {params.id}</p>
      </div>
      <AuditScanner auditId={params.id} />
    </div>
  );
}
