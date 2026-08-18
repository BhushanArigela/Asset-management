import { Suspense } from "react";
import { DisposalListPage } from "@/components/assets/disposal-list-page";

export const metadata = {
  title: "Disposed Assets | Sheraton Asset Management",
};

export default function DisposalPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <Suspense fallback={<div>Loading...</div>}>
        <DisposalListPage />
      </Suspense>
    </div>
  );
}
