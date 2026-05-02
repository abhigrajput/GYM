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
    const body = await request.json()
    const { data, error } = await supabase
      .from("members")
      .update({
        membership_status: body.status,
        expiry_date: body.expiry,
        trainer_id: body.trainerId,
      })
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
    const { error } = await supabase.from("members").delete().eq("id", params.id)
    if (error) return secureJson({ error: "Failed to remove member" }, { status: 500 })
    return secureJson({ success: true })
  } catch {
    return secureJson({ error: "Failed to remove member" }, { status: 500 })
  }
}
