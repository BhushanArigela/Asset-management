import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ReportViewer } from "@/components/reports/report-viewer";

export const metadata = {
  title: "Report Viewer | Sheraton Asset Management",
};

export default async function ReportTypePage(props: { params: Promise<{ type: string }> }) {
  const params = await props.params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Validate type if needed
  const allowedTypes = [
    "asset-register", "assets-by-building", "assets-by-department", 
    "damaged-assets", "missing-assets", "disposed-assets", "warranty-expiry", "amc-expiry"
  ];

  if (!allowedTypes.includes(params.type)) {
    return <div className="p-8">Invalid report type requested.</div>;
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight capitalize">
          {params.type.replace(/-/g, " ")} Report
        </h2>
      </div>
      <ReportViewer type={params.type} />
    </div>
  );
}
