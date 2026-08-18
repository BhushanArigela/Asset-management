import { VendorListPage } from "@/components/masters/vendors/vendor-list-page";

export const metadata = {
  title: "Vendors - Sheraton Asset Management",
};

export default function VendorsPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-[#1B2A4A]">Vendors</h2>
      </div>
      <VendorListPage />
    </div>
  );
}
