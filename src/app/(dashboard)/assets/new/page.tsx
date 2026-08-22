import { Suspense } from "react";
import { AssetForm } from "@/components/assets/asset-form";

export const metadata = {
  title: "Register Asset | Sheraton Asset Management",
};

export default function NewAssetPage() {
  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <Suspense fallback={<div>Loading form...</div>}>
        <AssetForm />
      </Suspense>
    </div>
  );
}
