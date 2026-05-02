export const dynamic = "force-dynamic"

import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { StatCard } from "@/components/ui/stat-card"
import { OwnerDashboardShare } from "./owner-dashboard-share"

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
}

export default async function OwnerDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
  const { data: gym } = await supabase.from("gyms").select("*").eq("owner_id", user.id).maybeSingle()
  const { data: members } = gym
    ? await supabase.from("members").select("*").eq("gym_id", gym.id).order("created_at", { ascending: false })
    : { data: [] as Record<string, unknown>[] }
  const { data: attendance } = gym
    ? await supabase
        .from("attendance")
        .select("*")
        .eq("gym_id", gym.id)
        .eq("date", new Date().toISOString().slice(0, 10))
        .order("checked_in_at", { ascending: false })
    : { data: [] as Record<string, unknown>[] }

  const activeMembers = (members || []).filter((m: { membership_status?: string }) => m.membership_status === "active").length
  const todayCheckins = (attendance || []).length
  const totalMembers = (members || []).length
  const revenueThisMonth = (Number(gym?.monthly_fee) || 0) * activeMembers
  const expiringThisWeek = (members || []).filter((m: { expiry_date?: string | null }) => {
    if (!m.expiry_date) return false
    const d = new Date(m.expiry_date)
    const now = new Date()
    const in7 = new Date(now)
    in7.setDate(now.getDate() + 7)
    return d >= now && d <= in7
  }).length

  const gymCode = (gym as { gym_code?: string })?.gym_code || "------"
  const subStatus = (gym as { subscription_status?: string })?.subscription_status || "trial"

  return (
    <div className="relative p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">{gym?.name || "Your Gym"}</h1>
          <p className="text-sm text-white/50">{gym?.city || profile?.city || "India"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OwnerDashboardShare gymCode={gymCode} />
          <span
            className={`rounded-full border px-3 py-1 text-xs font-medium ${
              subStatus === "active"
                ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                : subStatus === "trial"
                  ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
                  : "border-red-500/40 bg-red-500/10 text-red-300"
            }`}
          >
            {subStatus}
          </span>
          <Link href="/owner/members">
            <GradientButton size="sm">Naya Member Jodo</GradientButton>
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active members" value={activeMembers} change="+vs LM" changeType="up" glow="purple" />
        <StatCard title="Today's check-ins" value={`${todayCheckins}/${totalMembers}`} glow="cyan" />
        <StatCard title="Revenue (est.)" value={formatCurrency(revenueThisMonth)} glow="pink" prefix="" />
        <StatCard
          title="Expiring this week"
          value={expiringThisWeek}
          glow={expiringThisWeek > 0 ? "purple" : "none"}
          change={expiringThisWeek > 0 ? "renew" : undefined}
          changeType={expiringThisWeek > 0 ? "down" : "neutral"}
        />
      </section>

      <GlassCard className="mt-8 p-6" glow="cyan">
        <h3 className="font-heading text-lg text-white">Quick actions</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/owner/members">
            <GradientButton variant="secondary" size="sm">
              Members
            </GradientButton>
          </Link>
          <Link href="/owner/equipment">
            <GradientButton variant="secondary" size="sm">
              Equipment
            </GradientButton>
          </Link>
          <Link href="/owner/billing">
            <GradientButton variant="secondary" size="sm">
              Billing
            </GradientButton>
          </Link>
        </div>
      </GlassCard>
    </div>
  )
}
