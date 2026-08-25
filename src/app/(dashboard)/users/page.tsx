import { UserListPage } from "@/components/users/user-list-page";

export const metadata = {
  title: "User Management - Sheraton Asset Management",
};

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight text-[#1B2A4A]">Users</h2>
      </div>
      <div className="h-full flex-1 flex-col space-y-8">
        <UserListPage />
      </div>
    </div>
  );
}
