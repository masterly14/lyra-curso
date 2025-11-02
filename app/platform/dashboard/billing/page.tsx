import { Suspense } from "react";
import { Plans } from "@/components/billing/GetPlans";
import { UserButton } from "@clerk/nextjs";

export default async function BillingPage() {

  return <div>
    <Suspense fallback={<div>Cargando planes...</div>}>
        <Plans />
        <UserButton />
    </Suspense>
  </div>;
}