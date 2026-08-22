import { Suspense } from "react";
import { AssetForm } from "@/components/assets/asset-form";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Edit Asset | Sheraton Asset Management",
};

export default async function EditAssetPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  
  const asset = await prisma.asset.findUnique({
    where: { id: params.id },
    include: {
      assetWarranties: true,
      assetAmcs: true,
    }
  });

  if (!asset) {
    notFound();
  }

  // Convert dates to string format expected by inputs
  const formatDate = (date: Date | null | undefined) => date ? date.toISOString().split('T')[0] : "";

  const { assetWarranties, assetAmcs, ...safeAsset } = asset;

  const initialData = {
    ...safeAsset,
    purchaseCost: safeAsset.purchaseCost ? Number(safeAsset.purchaseCost) : undefined,
    description: asset.description || "",
    notes: asset.notes || "",
    invoiceRef: asset.invoiceRef || "",
    serialNumber: asset.serialNumber || "",
    model: asset.model || "",
    purchaseDate: formatDate(asset.purchaseDate),
    commissioningDate: formatDate(asset.commissioningDate),
    warranty: asset.assetWarranties && asset.assetWarranties.length > 0 ? {
      ...asset.assetWarranties[0],
      startDate: formatDate(asset.assetWarranties[0].startDate),
      expiryDate: formatDate(asset.assetWarranties[0].expiryDate),
      reference: asset.assetWarranties[0].reference || "",
      terms: asset.assetWarranties[0].terms || "",
    } : null,
    amc: asset.assetAmcs && asset.assetAmcs.length > 0 ? {
      ...asset.assetAmcs[0],
      value: asset.assetAmcs[0].value ? Number(asset.assetAmcs[0].value) : undefined,
      startDate: formatDate(asset.assetAmcs[0].startDate),
      expiryDate: formatDate(asset.assetAmcs[0].expiryDate),
      contractRef: asset.assetAmcs[0].contractRef || "",
      terms: asset.assetAmcs[0].terms || "",
    } : null,
  };

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <Suspense fallback={<div>Loading form...</div>}>
        <AssetForm initialData={initialData} />
      </Suspense>
    </div>
  );
}
