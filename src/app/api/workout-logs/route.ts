export const dynamic = "force-dynamic"

import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/workout-logs")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")
    if (!memberId) return secureJson({ error: "memberId required" }, { status: 400 })

    const { data, error } = await supabase
      .from("workout_logs")
      .select("*")
      .eq("member_id", memberId)
      .order("workout_date", { ascending: false })
    if (error) return secureJson({ error: "Failed to fetch workout logs" }, { status: 500 })
    return secureJson({ workout_logs: data || [] })
  } catch {
    return secureJson({ error: "Failed to fetch workout logs" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/workout-logs")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const payload = {
      member_id: body.member_id,
      plan_id: body.plan_id ?? null,
      workout_date: body.workout_date ?? new Date().toISOString().split("T")[0],
      exercises_json: body.exercises_json ?? { exercises: [] },
      duration_minutes: Number(body.duration_minutes ?? 0),
      completed: Boolean(body.completed),
      mood: Math.min(5, Math.max(1, Number(body.mood ?? 3))),
    }
    if (!payload.member_id) return secureJson({ error: "member_id required" }, { status: 400 })

    const { data, error } = await supabase.from("workout_logs").insert(payload).select("*").single()
    if (error) return secureJson({ error: "Failed to save workout log" }, { status: 500 })
    return secureJson({ workout_log: data })
  } catch {
    return secureJson({ error: "Failed to save workout log" }, { status: 500 })
  }
}
