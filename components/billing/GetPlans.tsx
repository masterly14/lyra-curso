import type { Plans } from "@prisma/client";
import { prisma } from "@/lib/db";
import { syncPlans } from "@/lib/actions/lemonsqueezy";
import { Plan } from "./plans/Plans";

export async function Plans() {
  let allPlans: Plans[] | undefined = await prisma.plans.findMany();

  if (!allPlans.length) {
    allPlans = await syncPlans();
  }

  if (!allPlans.length) {
    return <p>No plans available.</p>;
  }

  return (
    <div>
      <h2>Plans</h2>

      <div className="mb-5 mt-3 grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-5">
        {allPlans.map((plan, index) => {
          return <Plan key={`plan-${index}`} plan={plan} />;
        })}
      </div>
    </div>
  );
}
