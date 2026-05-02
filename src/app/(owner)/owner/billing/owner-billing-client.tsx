"use client"

import { useState } from "react"
import { toast } from "sonner"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"

export function OwnerBillingClient({
  gym,
  subscriptions,
}: {
  gym: Record<string, unknown> | null
  subscriptions: Record<string, unknown>[]
}) {
  const [loading, setLoading] = useState(false)

  const upgrade = async () => {
    if (!gym?.id) return
    setLoading(true)
    try {
      const res = await fetch("/api/billing/create-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gymId: gym.id, plan: "pro" }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Billing failed")
      if (data.payment_link) window.location.href = data.payment_link
      else toast.success("Subscription created")
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error")
    } finally {
      setLoading(false)
    }
  }

  const status = (gym?.subscription_status as string) || "trial"
  const trialEnds = gym?.trial_ends_at ? new Date(String(gym.trial_ends_at)).toLocaleDateString() : "—"

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <h1 className="font-heading text-2xl font-bold text-white">Billing</h1>

      <GlassCard className="p-6" glow="purple">
        <p className="text-sm uppercase tracking-wider text-white/45">Current plan</p>
        <p className="mt-2 font-heading text-2xl font-bold capitalize text-white">{status}</p>
        <p className="mt-1 text-sm text-white/55">Trial ends: {trialEnds}</p>
        <GradientButton className="mt-6" loading={loading} onClick={() => void upgrade()}>
          Upgrade to Pro — ₹2,000/month
        </GradientButton>
        <ul className="mt-6 space-y-2 text-sm text-white/65">
          <li>• Unlimited AI plans</li>
          <li>• Analytics + attendance</li>
          <li>• Priority support</li>
        </ul>
      </GlassCard>

      <GlassCard className="p-6">
        <h2 className="font-heading text-lg text-white">Payment history</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/45">
              <tr>
                <th className="pb-2">Plan</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-4 text-white/45">
                    No rows yet
                  </td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={String(s.id)} className="border-t border-white/10">
                    <td className="py-2">{String(s.plan)}</td>
                    <td>₹{String(s.amount)}</td>
                    <td>{String(s.status)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  )
}
