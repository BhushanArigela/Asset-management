import { Suspense } from "react";
import { MaintenanceListPage } from "@/components/maintenance/maintenance-list-page";

export const metadata = {
  title: "Maintenance | Sheraton Asset Management",
};

export default function MaintenancePage() {
  return (
    <Suspense fallback={<div className="p-6">Loading maintenance...</div>}>
      <MaintenanceListPage />
    </Suspense>
  );
}
