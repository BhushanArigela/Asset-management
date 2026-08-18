import { Suspense } from "react";
import { MovementForm } from "@/components/movements/movement-form";

export const metadata = {
  title: "Transfer Asset | Sheraton Asset Management",
};

export default function NewMovementPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Transfer Asset</h2>
      <Suspense fallback={<div>Loading form...</div>}>
        <MovementForm />
      </Suspense>
    </div>
  );
}
