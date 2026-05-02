export const dynamic = "force-dynamic"

import { cacheLeaderboard } from "@/lib/cache/redis-cache"
import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/leaderboard")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const gymId = searchParams.get("gymId")
    if (!gymId) return secureJson({ error: "gymId required" }, { status: 400 })

    const payload = await cacheLeaderboard(gymId, async () => {
      const { data: members, error } = await supabase.from("members").select("*").eq("gym_id", gymId)
      if (error) throw new Error("leaderboard query failed")

      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - 7)
      const startDate = weekStart.toISOString().slice(0, 10)

      const ranked = await Promise.all(
        (members || []).map(async (m: Record<string, unknown>) => {
          const { count } = await supabase
            .from("workout_logs")
            .select("*", { count: "exact", head: true })
            .eq("member_id", m.id as string)
            .gte("workout_date", startDate)
          const workoutsThisWeek = count || 0
          const dpw = (m.days_per_week as number) || 4
          const consistency = Math.round((workoutsThisWeek / Math.max(1, dpw)) * 100)
          const streak = (m.streak_count as number) || 0
          const score = streak * 3 + workoutsThisWeek * 10 + consistency
          return { ...m, workouts_this_week: workoutsThisWeek, consistency_percentage: consistency, score }
        })
      )

      ranked.sort((a, b) => b.score - a.score)
      const top10 = ranked.slice(0, 10).map((m, i) => ({ rank: i + 1, ...m }))
      return { leaderboard: top10 }
    })

    return secureJson(payload, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    })
  } catch {
    return secureJson({ error: "Failed to load leaderboard" }, { status: 500 })
  }
}
