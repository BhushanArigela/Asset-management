import { Suspense } from "react";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";

export const metadata = {
  title: "New Maintenance Request | Sheraton Asset Management",
};

export default function NewMaintenancePage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-2xl font-bold tracking-tight">Raise Maintenance Request</h2>
      <Suspense fallback={<div>Loading form...</div>}>
        <MaintenanceForm />
      </Suspense>
    </div>
  );
}
