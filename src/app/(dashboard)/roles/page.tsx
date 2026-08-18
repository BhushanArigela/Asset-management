import { RoleListPage } from "@/components/roles/role-list-page";

export const metadata = {
  title: "Role Management - Sheraton Asset Management",
};

export default function RolesPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#1B2A4A]">Roles</h2>
      </div>
      <div className="hidden h-full flex-1 flex-col space-y-8 md:flex">
        <RoleListPage />
      </div>
    </div>
  );
}
