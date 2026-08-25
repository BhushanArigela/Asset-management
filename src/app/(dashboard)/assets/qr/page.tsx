import { Suspense } from "react";

export const metadata = {
  title: "QR Codes | Sheraton Asset Management",
};

export default function QrManagementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-2xl font-bold tracking-tight">QR Code Management</h2>
      <Suspense fallback={<div>Loading...</div>}>
        <div className="p-4 border rounded">QR management feature UI would go here. Please use Asset List actions for individual QR generation.</div>
      </Suspense>
    </div>
  );
}
