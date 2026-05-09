"use client"

export const dynamic = "force-dynamic"

import { useEffect, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { StatCard } from "@/components/ui/stat-card"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number | string> | null>(null)
  const [users, setUsers] = useState<Record<string, unknown>[]>([])
  const [gyms, setGyms] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [s, u, g] = await Promise.all([
          fetch("/api/admin/stats").then((r) => r.json()),
          fetch("/api/admin/users").then((r) => r.json()),
          fetch("/api/admin/gyms").then((r) => r.json()),
        ])
        setStats(s)
        setUsers(u.users || [])
        setGyms(g.gyms || [])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  const exportCsv = () => {
    const rows = users.map((x) => Object.values(x).join(","))
    const blob = new Blob([rows.join("\n")], { type: "text/csv" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = "users.csv"
    a.click()
  }

  const extendTrial = async (gymId: string) => {
    await fetch("/api/admin/gyms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "extend_trial", gymId }),
    })
    const g = await fetch("/api/admin/gyms").then((r) => r.json())
    setGyms(g.gyms || [])
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-white/50">Loading admin…</p>
      </div>
    )
  }

  return (
    <div className="space-y-10 bg-black p-4 sm:p-8">
      <div>
        <h1 className="font-heading text-3xl font-bold text-[#00FF41]">ADMIN OVERVIEW</h1>
        <p className="font-mono text-xs text-[#888888]">Real-time platform telemetry</p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard title="TOTAL USERS" value={Number(stats?.totalUsers ?? 0)} />
        <StatCard title="ACTIVE GYMS" value={Number(stats?.totalGyms ?? 0)} />
        <StatCard title="AI CALLS TODAY" value={Number(stats?.aiCallsToday ?? 0)} />
        <StatCard title="API COST TODAY ₹" value={Number(stats?.estimatedCostTodayINR ?? 0)} />
        <StatCard title="MRR ₹" value={Number(stats?.monthlyRevenueINR ?? 0) > 0 ? Number(stats?.monthlyRevenueINR ?? 0) : "No data yet"} />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <StatCard
          title="MOM GROWTH"
          value={
            typeof stats?.momGrowthPercent === "number"
              ? `${stats.momGrowthPercent}%`
              : "No data yet"
          }
        />
      </section>

      <GlassCard id="users" className="scroll-mt-24 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl font-semibold text-[#00FF41]">&gt; USERS</h2>
          <GradientButton size="sm" variant="outline" onClick={exportCsv}>
            Export CSV
          </GradientButton>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm font-mono">
            <thead className="text-[#00FF41]">
              <tr>
                <th className="pb-2">Name</th>
                <th>Phone</th>
                <th>Role</th>
                <th>City</th>
              </tr>
            </thead>
            <tbody>
              {users.slice(0, 40).map((u: Record<string, unknown>) => (
                <tr key={String(u.id)} className="border-t border-[#00FF41]/20 odd:bg-[#111111]">
                  <td className="py-2">{String(u.full_name || "—")}</td>
                  <td>{String(u.phone || "—")}</td>
                  <td>{String(u.role || "")}</td>
                  <td>{String(u.city || "—")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <GlassCard id="gyms" className="scroll-mt-24 p-6">
        <h2 className="font-heading mb-4 text-xl font-semibold text-[#00FF41]">&gt; GYMS</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm font-mono">
            <thead className="text-[#00FF41]">
              <tr>
                <th className="pb-2">Name</th>
                <th>City</th>
                <th>Owner</th>
                <th>Members</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {gyms.slice(0, 40).map((g: Record<string, unknown>) => (
                <tr key={String(g.id)} className="border-t border-[#00FF41]/20 odd:bg-[#111111]">
                  <td className="py-2">{String(g.name)}</td>
                  <td>{String(g.city)}</td>
                  <td>{String(g.owner_name)}</td>
                  <td>{String(g.member_count)}</td>
                  <td>{String(g.subscription_status)}</td>
                  <td>
                    <GradientButton size="sm" variant="ghost" onClick={() => void extendTrial(String(g.id))}>
                      Extend Trial
                    </GradientButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <section id="ai" className="scroll-mt-24 grid gap-4 md:grid-cols-2">
        <GlassCard className="p-6">
          <h2 className="font-heading text-lg font-semibold text-[#00FF41]">&gt; AI USAGE</h2>
          <p className="mt-2 text-sm text-[#888888]">Calls per feature roll up from ai_usage_logs once populated.</p>
        </GlassCard>
        <GlassCard id="revenue" className="scroll-mt-24 p-6">
          <h2 className="font-heading text-lg font-semibold text-[#00FF41]">&gt; REVENUE</h2>
          <p className="mt-2 text-sm text-[#888888]">MRR from subscriptions table and Razorpay webhooks.</p>
        </GlassCard>
      </section>
    </div>
  )
}
