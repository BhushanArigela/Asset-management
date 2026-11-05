import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { auth } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
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
