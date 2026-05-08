export const dynamic = "force-dynamic"

import { createServiceRoleClient } from "@/lib/db/connection-pool"
import { secureJson, enforceRateLimit } from "@/lib/security/api"
import { requireAdmin } from "@/lib/security/admin"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/admin/stats")
    if (limited) return limited
    const gate = await requireAdmin()
    if (!gate.ok) return gate.response

    const db = createServiceRoleClient()
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString()

    const [{ count: userCount }, { count: gymCount }] = await Promise.all([
      db.from("profiles").select("*", { count: "exact", head: true }),
      db.from("gyms").select("*", { count: "exact", head: true }),
    ])

    let aiToday = 0
    let logsToday: { cost_estimate: string | null }[] = []
    try {
      const r = await db.from("ai_usage_logs").select("*", { count: "exact", head: true }).gte("created_at", startOfDay)
      aiToday = r.count || 0
      const l = await db.from("ai_usage_logs").select("cost_estimate").gte("created_at", startOfDay)
      logsToday = (l.data || []) as { cost_estimate: string | null }[]
    } catch {
      aiToday = 0
      logsToday = []
    }

    let subs: { amount: number }[] = []
    try {
      const s = await db.from("subscriptions").select("amount, status").eq("status", "active")
      subs = (s.data || []) as { amount: number }[]
    } catch {
      subs = []
    }

    const costToday =
      (logsToday || []).reduce((s, r: { cost_estimate: string | null }) => s + Number(r.cost_estimate || 0), 0) || 0

    const mrr = subs.reduce((s, r) => s + (r.amount || 0), 0)

    let trial = 0
    let activeG = 0
    let expired = 0
    try {
      const { data: gymRows } = await db.from("gyms").select("subscription_status")
      trial = (gymRows || []).filter((g: { subscription_status: string }) => g.subscription_status === "trial").length
      activeG = (gymRows || []).filter((g: { subscription_status: string }) => g.subscription_status === "active").length
      expired = (gymRows || []).filter((g: { subscription_status: string }) => g.subscription_status === "expired").length
    } catch {
      trial = activeG = expired = 0
    }

    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString()
    let momGrowthPercent: number | null = null
    try {
      const [{ data: current }, { data: previous }] = await Promise.all([
        db.from("subscriptions").select("amount").eq("status", "active").gte("created_at", currentMonthStart),
        db
          .from("subscriptions")
          .select("amount")
          .eq("status", "active")
          .gte("created_at", prevMonthStart)
          .lt("created_at", currentMonthStart),
      ])
      const currentRev = (current || []).reduce((sum, s: { amount: number | null }) => sum + Number(s.amount || 0), 0)
      const prevRev = (previous || []).reduce((sum, s: { amount: number | null }) => sum + Number(s.amount || 0), 0)
      if (prevRev > 0) {
        momGrowthPercent = Math.round(((currentRev - prevRev) / prevRev) * 100)
      }
    } catch {
      momGrowthPercent = null
    }

    return secureJson({
      totalUsers: userCount || 0,
      totalGyms: gymCount || 0,
      gymsByStatus: { trial, active: activeG, expired },
      aiCallsToday: aiToday || 0,
      estimatedCostTodayINR: Math.round(costToday * 83),
      monthlyRevenueINR: mrr,
      momGrowthPercent,
    })
  } catch {
    return secureJson({ error: "Stats failed" }, { status: 500 })
  }
}
