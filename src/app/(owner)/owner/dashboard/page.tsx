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
  const equipment = gym ? (await supabase.from("equipment").select("id,name,is_functional").eq("gym_id", gym.id)).data || [] : []

  return (
    <div className="relative bg-black p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white md:text-3xl">{gym?.name || "YOUR GYM"}</h1>
          <p className="font-mono text-xs text-[#888888]">{gym?.city || profile?.city || "INDIA"}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OwnerDashboardShare gymCode={gymCode} />
          <span
            className={`rounded border px-3 py-1 text-xs font-medium uppercase tracking-[0.12em] ${
              subStatus === "active"
                ? "border-[#00FF41] bg-[#00FF41]/10 text-[#00FF41]"
                : subStatus === "trial"
                  ? "border-[#FFB800]/40 bg-[#FFB800]/10 text-[#FFB800]"
                  : "border-[#FF0040]/40 bg-[#FF0040]/10 text-[#FF0040]"
            }`}
          >
            {subStatus}
          </span>
          <Link href="/owner/members">
            <GradientButton size="sm">ADD MEMBER</GradientButton>
          </Link>
        </div>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="TOTAL MEMBERS" value={activeMembers} />
        <StatCard title="TODAY'S CHECK-INS" value={`${todayCheckins}/${totalMembers}`} />
        <StatCard title="MONTHLY REVENUE ₹" value={formatCurrency(revenueThisMonth)} prefix="" />
        <StatCard
          title="EXPIRING SOON"
          value={expiringThisWeek}
          change={expiringThisWeek > 0 ? "action required" : undefined}
          changeType={expiringThisWeek > 0 ? "down" : "neutral"}
        />
      </section>

      <GlassCard className="mt-8 p-6">
        <h3 className="font-heading text-lg text-[#00FF41]">QUICK ACTIONS</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/owner/members">
            <GradientButton variant="outline" size="sm">
              Members
            </GradientButton>
          </Link>
          <Link href="/owner/equipment">
            <GradientButton variant="outline" size="sm">
              Equipment
            </GradientButton>
          </Link>
          <Link href="/owner/billing">
            <GradientButton variant="outline" size="sm">
              Billing
            </GradientButton>
          </Link>
        </div>
      </GlassCard>

      <GlassCard className="mt-6 p-6">
        <h3 className="font-heading text-lg text-[#00FF41]">MEMBERS</h3>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm font-mono">
            <thead className="text-[#00FF41]">
              <tr>
                <th className="pb-2">ID</th>
                <th>Name</th>
                <th>Status</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody>
              {(members || []).slice(0, 12).map((m: any) => (
                <tr key={m.id} className="border-t border-[#00FF41]/20 odd:bg-[#111111]">
                  <td className="py-2">{String(m.id).slice(0, 8)}</td>
                  <td>Member {String(m.id).slice(0, 4)}</td>
                  <td>{m.membership_status || "unknown"}</td>
                  <td>{m.expiry_date || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard className="mt-6 p-6">
        <h3 className="font-heading text-lg text-[#00FF41]">EQUIPMENT STATUS</h3>
        <div className="mt-3 space-y-2 text-sm font-mono">
          {equipment.map((item: any) => (
            <p key={item.id} className="text-[#888888]">
              &gt; {item.name}{" "}
              <span className={item.is_functional === false ? "text-[#FF0040]" : "text-[#00FF41]"}>
                {item.is_functional === false ? "● offline" : "● operational"}
              </span>
            </p>
          ))}
          {equipment.length === 0 ? <p className="text-[#888888]">&gt; No equipment data</p> : null}
        </div>
      </GlassCard>
    </div>
  )
}
