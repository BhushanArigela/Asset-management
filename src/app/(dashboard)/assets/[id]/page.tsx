import { Suspense } from "react";
import { AssetDetailPage } from "@/components/assets/asset-detail-page";

export const metadata = {
  title: "Asset Details | Sheraton Asset Management",
};

export default async function AssetDetail(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<div className="p-6">Loading asset details...</div>}>
        <AssetDetailPage assetId={params.id} />
      </Suspense>
    </div>
  );
}
