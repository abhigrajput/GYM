export const dynamic = "force-dynamic"

import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/progress/strength")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")
    if (!memberId) return secureJson({ error: "memberId required" }, { status: 400 })

    const { data: logs, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("member_id", memberId)
      .order("workout_date", { ascending: true })
    if (error) return secureJson({ error: "Failed to fetch strength logs" }, { status: 500 })

  const map = new Map<string, { exercise: string; current_max_weight: number; pr_date: string; progression: { date: string; weight: number; reps: number }[] }>()
  ;(logs || []).forEach((log: any) => {
    const exercises = (log.exercises_json?.exercises || []) as any[]
    exercises.forEach((ex) => {
      const name = String(ex.name || "Unknown Exercise")
      const weight = Number(ex.weight || 0)
      const reps = Number(ex.reps || 0)
      if (!map.has(name)) {
        map.set(name, { exercise: name, current_max_weight: weight, pr_date: log.workout_date, progression: [] })
      }
      const row = map.get(name)!
      row.progression.push({ date: log.workout_date, weight, reps })
      if (weight >= row.current_max_weight) {
        row.current_max_weight = weight
        row.pr_date = log.workout_date
      }
    })
  })

    return secureJson({ data: Array.from(map.values()) })
  } catch {
    return secureJson({ error: "Failed to fetch strength logs" }, { status: 500 })
  }
}
