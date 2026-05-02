export const dynamic = "force-dynamic"

import { secureJson, enforceRateLimit, requireUser, validateBody } from "@/lib/security/api"
import { z } from "zod"

const JoinBody = z
  .object({
    gymId: z.string().uuid().optional(),
    gymCode: z.string().min(1).max(8).optional(),
  })
  .refine((b) => b.gymId || b.gymCode, { message: "gymId or gymCode required" })

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/gyms/join")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const parsed = validateBody(JoinBody, body)
    if (!parsed.ok) return parsed.response
    const { gymId, gymCode } = parsed.data

    let q = supabase.from("gyms").select("*").in("subscription_status", ["active", "trial"])
    if (gymId) {
      q = q.eq("id", gymId)
    } else {
      q = q.eq("gym_code", gymCode!.toUpperCase().trim())
    }

    const { data: gym, error: gymError } = await q.maybeSingle()
    if (gymError || !gym) {
      return secureJson({ error: "Gym not found" }, { status: 404 })
    }

    const { data: member, error: memErr } = await supabase
      .from("members")
      .select("id")
      .eq("profile_id", user.id)
      .maybeSingle()
    if (memErr) return secureJson({ error: "Member profile missing" }, { status: 400 })
    if (!member) {
      return secureJson({ error: "Create member profile first" }, { status: 400 })
    }

    const { data: updated, error: upErr } = await supabase
      .from("members")
      .update({ gym_id: gym.id, membership_status: "active", workout_environment: "gym" })
      .eq("id", member.id)
      .select("*")
      .single()
    if (upErr) return secureJson({ error: upErr.message }, { status: 500 })

    return secureJson({ gym, member: updated })
  } catch {
    return secureJson({ error: "Join failed" }, { status: 500 })
  }
}
