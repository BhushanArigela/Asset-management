import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Building, Layers, AlertTriangle, ShieldAlert, Package, Calendar } from "lucide-react";

export const metadata = {
  title: "Reports | Sheraton Asset Management",
};

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const reportCategories = [
    {
      title: "Asset Reports",
      reports: [
        { title: "Asset Register", type: "asset-register", icon: FileText, desc: "Complete list of all assets" },
        { title: "By Building", type: "assets-by-building", icon: Building, desc: "Assets grouped by location" },
        { title: "By Department", type: "assets-by-department", icon: Layers, desc: "Assets assigned to departments" },
      ]
    },
    {
      title: "Operational Reports",
      reports: [
        { title: "Damaged Assets", type: "damaged-assets", icon: AlertTriangle, desc: "List of all damaged items" },
        { title: "Missing Assets", type: "missing-assets", icon: ShieldAlert, desc: "List of untracked assets" },
        { title: "Disposed Assets", type: "disposed-assets", icon: Package, desc: "List of disposed assets" },
      ]
    },
    {
      title: "Compliance & Financial",
      reports: [
        { title: "Warranty Expiry", type: "warranty-expiry", icon: Calendar, desc: "Warranties expiring soon" },
        { title: "AMC Expiry", type: "amc-expiry", icon: Calendar, desc: "Maintenance contracts ending soon" },
      ]
    }
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">Select a report type to view, filter, and export data.</p>
      </div>

      <div className="grid gap-6">
        {reportCategories.map((category) => (
          <div key={category.title} className="space-y-4">
            <h3 className="text-xl font-semibold border-b pb-2 text-[#1B2A4A]">{category.title}</h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {category.reports.map((report) => (
                <Link href={`/reports/${report.type}`} key={report.type}>
                  <Card className="hover:border-[#C5A55A] hover:shadow-md transition-all cursor-pointer h-full">
                    <CardHeader className="flex flex-row items-center gap-4 pb-2">
                      <div className="p-2 bg-[#1B2A4A]/10 rounded-md">
                        <report.icon className="w-6 h-6 text-[#1B2A4A]" />
                      </div>
                      <CardTitle className="text-base">{report.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{report.desc}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
