export const dynamic = "force-dynamic"

import { sanitizeText, sanitizeNumber } from "@/lib/security/sanitize"
import { EquipmentScanSchema } from "@/lib/security/validation"
import { secureJson, enforceRateLimit, requireUser, validateBody } from "@/lib/security/api"

type EquipmentItem = {
  name: string
  category: "free_weights" | "machines" | "cardio" | "cables" | "bodyweight" | "other"
  quantity: number
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/equipment/add")
    if (limited) return limited
    const body = await request.json()
    const gymCheck = validateBody(EquipmentScanSchema, { gymId: body?.gymId })
    if (!gymCheck.ok) return gymCheck.response
    const gymId = gymCheck.data.gymId
    const equipment = (body?.equipment ?? []) as EquipmentItem[]

    if (!gymId || !Array.isArray(equipment) || equipment.length === 0) {
      return secureJson({ error: "gymId and equipment[] are required." }, { status: 400 })
    }

    const { supabase, user } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const { data: gym } = await supabase.from("gyms").select("id,owner_id").eq("id", gymId).maybeSingle()
    if (!gym || gym.owner_id !== user.id) {
      return secureJson({ error: "You do not own this gym." }, { status: 403 })
    }

    const payload = equipment.map((item) => ({
      gym_id: gymId,
      name: sanitizeText(item.name),
      category: item.category,
      quantity: sanitizeNumber(item.quantity) || 1,
      is_functional: true,
    }))

    const { data: inserted, error } = await supabase.from("equipment").insert(payload).select("*")
    if (error) throw error

    return secureJson({ equipment: inserted ?? [] })
  } catch {
    return secureJson({ error: "Failed to add equipment." }, { status: 500 })
  }
}
