import { Header } from "@/components/hero"
import { Features } from "@/components/features"
import { Demo } from "@/components/demo"
import { Pricing } from "@/components/pricing"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Features />
        <Demo />
        <Pricing />
      </main>
      <Footer />
    </div>
  )
}
