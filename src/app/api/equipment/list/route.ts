export const dynamic = "force-dynamic"

import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/equipment/list")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const gymId = searchParams.get("gymId")
    if (!gymId) return secureJson({ error: "gymId is required" }, { status: 400 })
    const { data: equipment, error } = await supabase
      .from("equipment")
      .select("*")
      .eq("gym_id", gymId)
      .order("category")
      .order("name")
    if (error) throw error

    const { data: plans } = await supabase.from("workout_plans").select("equipment_used").eq("gym_id", gymId)
    const utilizationMap = new Map<string, number>()
    ;(plans || []).forEach((plan: any) => {
      ;(plan.equipment_used || []).forEach((name: string) => {
        utilizationMap.set(name, (utilizationMap.get(name) || 0) + 1)
      })
    })

    const grouped = (equipment || []).reduce((acc: Record<string, any[]>, item: any) => {
      const key = item.category || "other"
      if (!acc[key]) acc[key] = []
      acc[key].push({
        ...item,
        utilization_count: utilizationMap.get(item.name) || 0,
      })
      return acc
    }, {})

    return secureJson({ grouped })
  } catch {
    return secureJson({ error: "Failed to fetch equipment list." }, { status: 500 })
  }
}
