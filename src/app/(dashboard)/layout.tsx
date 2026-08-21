import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

// A mock session check, integrate with actual next-auth later
async function getSession() {
  return { user: { name: "Admin", email: "admin@sheraton.com", role: "admin" } };
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen w-full bg-slate-100">
      <Sidebar />
      <div className="flex w-full flex-col xl:pl-64">
        <Header user={session.user} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
