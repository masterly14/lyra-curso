import { Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getPlans } from "@/lib/actions/lemonsqueezy"
import { SignupButton } from "../billing/SignUpButton"

export async function PricingSection() {
  const plans = await getPlans()

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl mb-4 text-balance">
            Nuestros Planes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Elige el plan que mejor se adapte a tus necesidades.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.id} className="border-border/50 hover:border-primary/50 transition-colors flex flex-col">
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-foreground mb-2">{plan.productName}</CardTitle>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="text-4xl font-bold text-foreground mb-4">
                  ${plan.price}
                  <span className="text-lg text-muted-foreground">/mes</span>
                </p>
                {plan.description && (
                  <div
                    className="text-muted-foreground space-y-2"
                    dangerouslySetInnerHTML={{
                      __html: plan.description,
                    }}
                  />
                )}
              </CardContent>
              <div className="p-6 pt-0">
                <SignupButton plan={plan} />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
