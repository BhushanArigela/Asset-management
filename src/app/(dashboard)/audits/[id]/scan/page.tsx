import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuditScanner } from "@/components/audits/audit-scanner";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Asset Scanner</h2>
          <p className="text-muted-foreground">Session ID: {params.id}</p>
        </div>
        <Link href={`/audits/${params.id}`}>
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Done Scanning / Go Back
          </Button>
        </Link>
      </div>
      <AuditScanner auditId={params.id} />
    </div>
  );
}
