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
    <div className="flex-1 bg-[#F4F7FE] min-h-screen">
      <DashboardPage />
    </div>
  );
}
