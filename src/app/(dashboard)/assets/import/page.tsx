import { Suspense } from "react";
import { ImportPage } from "@/components/assets/import-page";

export const metadata = {
  title: "Import Assets | Sheraton Asset Management",
};

export default function ImportAssetsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<div>Loading import...</div>}>
        <ImportPage />
      </Suspense>
    </div>
  );
}
