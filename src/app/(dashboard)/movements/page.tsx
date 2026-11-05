import { Suspense } from "react";
import { MovementListPage } from "@/components/movements/movement-list-page";

export const metadata = {
  title: "Asset Movements | NLAG Asset Management",
};

export default function MovementsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading movements...</div>}>
      <MovementListPage />
    </Suspense>
  );
}
