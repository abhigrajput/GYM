export const dynamic = "force-dynamic"

import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

type Context = { params: { id: string } }

export async function GET(_: Request, { params }: Context) {
  try {
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })
    const { data, error } = await supabase.from("members").select("*").eq("id", params.id).maybeSingle()
    if (error) return secureJson({ error: "Failed to fetch member" }, { status: 500 })
    return secureJson({ member: data })
  } catch {
    return secureJson({ error: "Failed to fetch member" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: Context) {
  try {
    const limited = enforceRateLimit(request, "/api/members/[id]")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })
    const { data: target } = await supabase
      .from("members")
      .select("profile_id, gym_id")
      .eq("id", params.id)
      .maybeSingle()
    let allowed = target?.profile_id === user.id
    if (!allowed && target?.gym_id) {
      const { data: gym } = await supabase
        .from("gyms")
        .select("owner_id")
        .eq("id", target.gym_id)
        .maybeSingle()
      allowed = gym?.owner_id === user.id
    }
    if (!allowed) {
      return secureJson({ error: "Forbidden" }, { status: 403 })
    }
    const body = await request.json()
    const patch = {
      membership_status: body.status,
      expiry_date: body.expiry,
      trainer_id: body.trainerId,
      workout_environment: body.workout_environment,
      home_equipment: body.home_equipment,
      language_preference: body.language_preference,
    }
    const updates = Object.fromEntries(
      Object.entries(patch).filter(([, v]) => v !== undefined && v !== null && v !== "")
    )
    const { data, error } = await supabase
      .from("members")
      .update(updates)
      .eq("id", params.id)
      .select("*")
      .maybeSingle()
    if (error) return secureJson({ error: "Failed to update member" }, { status: 500 })
    return secureJson({ member: data })
  } catch {
    return secureJson({ error: "Failed to update member" }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: Context) {
  try {
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })
    const { data: target } = await supabase.from("members").select("gym_id").eq("id", params.id).maybeSingle()
    if (!target) return secureJson({ error: "Member not found" }, { status: 404 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    const role = profile?.role
    let allowed = role === "admin"
    if (!allowed && target.gym_id) {
      const { data: gym } = await supabase.from("gyms").select("owner_id").eq("id", target.gym_id).maybeSingle()
      allowed = gym?.owner_id === user.id
    }
    if (!allowed) return secureJson({ error: "Forbidden" }, { status: 403 })

    const { error } = await supabase.from("members").delete().eq("id", params.id)
    if (error) return secureJson({ error: "Failed to remove member" }, { status: 500 })
    return secureJson({ success: true })
  } catch {
    return secureJson({ error: "Failed to remove member" }, { status: 500 })
  }
}
