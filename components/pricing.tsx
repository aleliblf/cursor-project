import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Check } from "lucide-react"

const plans = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for individual developers exploring open source",
    features: [
      "100 repository analyses per month",
      "Basic star analytics",
      "Repository summaries",
      "Cool facts discovery",
      "Email support",
      "Community access",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    name: "Pro",
    price: "$19",
    description: "For serious developers and small teams",
    features: [
      "Unlimited repository analyses",
      "Advanced star analytics & trends",
      "Real-time PR tracking",
      "Version update notifications",
      "Historical data access",
      "Priority email support",
      "API access",
      "Custom webhooks",
    ],
    cta: "Coming Soon",
    popular: true,
    comingSoon: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For organizations with advanced needs",
    features: [
      "Everything in Pro",
      "Unlimited team members",
      "Advanced security features",
      "Custom integrations",
      "Dedicated support",
      "SLA guarantee",
      "On-premise deployment",
      "Custom training",
    ],
    cta: "Coming Soon",
    popular: false,
    comingSoon: true,
  },
]

export function Pricing() {
  return (
    <section id="pricing" className="py-12 md:py-20 lg:py-32 bg-muted/30">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12 md:mb-16">
          <h2 className="text-balance mb-4 text-2xl md:text-3xl font-bold tracking-tight lg:text-5xl">
            Simple, transparent pricing
          </h2>
          <p className="text-pretty text-base md:text-lg text-muted-foreground">
            Choose the plan that fits your needs. Start free, upgrade when you need more.
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-6 max-w-sm md:max-w-none mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative p-6 md:p-8 ${
                plan.popular ? "border-primary shadow-lg shadow-primary/10 lg:scale-105" : "border-border"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 md:-top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center rounded-full bg-primary px-3 md:px-4 py-1 text-xs md:text-sm font-medium text-primary-foreground">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl md:text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl md:text-4xl font-bold">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-sm md:text-base text-muted-foreground">/month</span>}
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <Button className="w-full mb-6" variant={plan.popular ? "default" : "outline"} size="lg" disabled={plan.comingSoon}>
                {plan.cta}
              </Button>

              <ul className="space-y-2 md:space-y-3">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start gap-2 md:gap-3 text-xs md:text-sm">
                    <Check className="h-4 w-4 md:h-5 md:w-5 shrink-0 text-primary mt-0.5" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
