import { Card } from "@/components/ui/card"
import { BarChart3, Star, Zap, GitPullRequest, Package, TrendingUp } from "lucide-react"

const features = [
  {
    icon: BarChart3,
    title: "Repository Summaries",
    description:
      "Get AI-powered comprehensive summaries of any repository, understanding its purpose, tech stack, and architecture at a glance.",
  },
  {
    icon: Star,
    title: "Star Analytics",
    description:
      "Track star growth over time, analyze contributor patterns, and understand repository popularity trends.",
  },
  {
    icon: Zap,
    title: "Cool Facts Discovery",
    description:
      "Uncover interesting insights about repositories - first commit, longest PR, most active contributors, and more.",
  },
  {
    icon: GitPullRequest,
    title: "Important PR Tracking",
    description:
      "Stay informed about critical pull requests, breaking changes, and important discussions happening in real-time.",
  },
  {
    icon: Package,
    title: "Version Updates",
    description:
      "Monitor releases, track semantic versioning, and get notified about new versions and changelog highlights.",
  },
  {
    icon: TrendingUp,
    title: "Growth Insights",
    description:
      "Visualize repository health metrics, community engagement, and predict future trends with advanced analytics.",
  },
]

export function Features() {
  return (
    <section id="features" className="py-20 lg:py-32">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-balance mb-4 text-3xl font-bold tracking-tight lg:text-5xl">
            Everything you need to analyze repositories
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Powerful features designed for developers, maintainers, and organizations who want deep insights into open
            source projects.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="group relative overflow-hidden border-border bg-card p-6 transition-all hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
