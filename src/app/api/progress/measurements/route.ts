export const dynamic = "force-dynamic"

import { MeasurementSchema } from "@/lib/security/validation"
import { sanitizeNumber } from "@/lib/security/sanitize"
import { secureJson, enforceRateLimit, requireUser, validateBody } from "@/lib/security/api"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/progress/measurements")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")
    if (!memberId) return secureJson({ error: "memberId required" }, { status: 400 })

    const { data, error } = await supabase
      .from("body_measurements")
      .select("*")
      .eq("member_id", memberId)
      .order("measured_at", { ascending: false })
    if (error) return secureJson({ error: "Failed to fetch measurements" }, { status: 500 })

  const latest = data?.[0]
  const prev = data?.[1]
  const changes = latest && prev
    ? {
        weight: (latest.weight || 0) - (prev.weight || 0),
        chest: (latest.chest || 0) - (prev.chest || 0),
        waist: (latest.waist || 0) - (prev.waist || 0),
        arms: ((latest.left_arm || 0) + (latest.right_arm || 0)) / 2 - ((prev.left_arm || 0) + (prev.right_arm || 0)) / 2,
      }
    : null

    return secureJson({ measurements: data || [], changes })
  } catch {
    return secureJson({ error: "Failed to fetch measurements" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/progress/measurements")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })
    const body = await request.json()
    const validated = validateBody(MeasurementSchema, {
      weight: sanitizeNumber(body.weight) || 0,
      chest: sanitizeNumber(body.chest) || 0,
      waist: sanitizeNumber(body.waist) || 0,
      arms: sanitizeNumber(body.left_arm || body.arms) || 0,
    })
    if (!validated.ok) return validated.response

    const payload = {
      ...body,
      weight: sanitizeNumber(body.weight),
      chest: sanitizeNumber(body.chest),
      waist: sanitizeNumber(body.waist),
      left_arm: sanitizeNumber(body.left_arm || body.arms),
      right_arm: sanitizeNumber(body.right_arm || body.arms),
    }
    const { data, error } = await supabase.from("body_measurements").insert(payload).select("*")
    if (error) return secureJson({ error: "Failed to save measurement" }, { status: 500 })
    const memberId = body.member_id
    const { data: measurements } = await supabase
      .from("body_measurements")
      .select("*")
      .eq("member_id", memberId)
      .order("measured_at", { ascending: false })
    const latest = measurements?.[0]
    const prev = measurements?.[1]
    const changes = latest && prev
      ? {
          weight: (latest.weight || 0) - (prev.weight || 0),
          chest: (latest.chest || 0) - (prev.chest || 0),
          waist: (latest.waist || 0) - (prev.waist || 0),
          arms: ((latest.left_arm || 0) + (latest.right_arm || 0)) / 2 - ((prev.left_arm || 0) + (prev.right_arm || 0)) / 2,
        }
      : null
    return secureJson({ inserted: data || [], measurements: measurements || [], changes })
  } catch {
    return secureJson({ error: "Failed to save measurement" }, { status: 500 })
  }
}
