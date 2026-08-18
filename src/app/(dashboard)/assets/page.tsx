import { Suspense } from "react";
import { AssetListPage } from "@/components/assets/asset-list-page";

export const metadata = {
  title: "Assets | Sheraton Asset Management",
  description: "Manage all hotel assets",
};

export default function AssetsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading assets...</div>}>
      <AssetListPage />
    </Suspense>
  );
}
