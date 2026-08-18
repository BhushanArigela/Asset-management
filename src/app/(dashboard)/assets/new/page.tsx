import { Suspense } from "react";
import { AssetForm } from "@/components/assets/asset-form";

export const metadata = {
  title: "Register Asset | Sheraton Asset Management",
};

export default function NewAssetPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Register Asset</h2>
      </div>
      <Suspense fallback={<div>Loading form...</div>}>
        <AssetForm />
      </Suspense>
    </div>
  );
}
