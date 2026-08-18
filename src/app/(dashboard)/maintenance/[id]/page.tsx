import { Suspense } from "react";
import { MaintenanceDetailPage } from "@/components/maintenance/maintenance-detail-page";

export const metadata = {
  title: "Maintenance Detail | Sheraton Asset Management",
};

export default async function MaintenanceDetailPageWrapper(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<div>Loading details...</div>}>
        <MaintenanceDetailPage id={params.id} />
      </Suspense>
    </div>
  );
}
