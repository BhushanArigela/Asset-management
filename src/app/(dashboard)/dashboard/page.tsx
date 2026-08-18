import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { DashboardPage } from "@/components/dashboard/dashboard-page";

export const metadata = {
  title: "Dashboard | Sheraton Asset Management",
  description: "Asset Management Dashboard",
};

export default async function DashboardRoute() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <DashboardPage />
    </div>
  );
}
