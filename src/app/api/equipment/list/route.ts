export const dynamic = "force-dynamic"

import { cacheEquipmentList } from "@/lib/cache/redis-cache"
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

    const payload = await cacheEquipmentList(gymId, async () => {
      const { data: equipment, error } = await supabase
        .from("equipment")
        .select("*")
        .eq("gym_id", gymId)
        .order("category")
        .order("name")
      if (error) throw error

      const { data: plans } = await supabase.from("workout_plans").select("equipment_used").eq("gym_id", gymId)
      const utilizationMap = new Map<string, number>()
      ;(plans || []).forEach((plan: { equipment_used?: string[] }) => {
        ;(plan.equipment_used || []).forEach((name: string) => {
          utilizationMap.set(name, (utilizationMap.get(name) || 0) + 1)
        })
      })

      const grouped = (equipment || []).reduce((acc: Record<string, unknown[]>, item: Record<string, unknown>) => {
        const key = (item.category as string) || "other"
        if (!acc[key]) acc[key] = []
        acc[key].push({
          ...item,
          utilization_count: utilizationMap.get(item.name as string) || 0,
        })
        return acc
      }, {})

      return { grouped }
    })

    return secureJson(payload, {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    })
  } catch {
    return secureJson({ error: "Failed to fetch equipment list." }, { status: 500 })
  }
}
