export const dynamic = "force-dynamic"

import Link from "next/link"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { Navbar } from "@/components/layout/navbar"

export default function PricingPage() {
  return (
    <main className="mesh-bg min-h-screen text-white">
      <Navbar />
      <div className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="font-heading text-4xl font-bold">Pricing</h1>
        <p className="mt-4 text-white/60">Members free forever. Gyms ₹2,000/month after 14-day trial.</p>
        <GlassCard className="mt-8 p-8">
          <Link href="/signup">
            <GradientButton>Get started</GradientButton>
          </Link>
        </GlassCard>
      </div>
    </main>
  )
}
