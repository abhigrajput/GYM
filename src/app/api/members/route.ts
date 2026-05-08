export const dynamic = "force-dynamic"

import { MemberAddSchema } from "@/lib/security/validation"
import { sanitizeText } from "@/lib/security/sanitize"
import { secureJson, enforceRateLimit, requireUser, validateBody } from "@/lib/security/api"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/members")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const gymId = searchParams.get("gymId")
    const status = searchParams.get("status")
    const level = searchParams.get("level")
    const goal = searchParams.get("goal")
    if (!gymId) return secureJson({ error: "gymId required" }, { status: 400 })

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    const role = profile?.role
    if (!role) return secureJson({ error: "Forbidden" }, { status: 403 })

    if (role === "member") {
      const { data: member } = await supabase.from("members").select("gym_id").eq("profile_id", user.id).maybeSingle()
      if (!member?.gym_id || member.gym_id !== gymId) {
        return secureJson({ error: "Forbidden" }, { status: 403 })
      }
    } else if (role === "owner") {
      const { data: gym } = await supabase.from("gyms").select("id").eq("id", gymId).eq("owner_id", user.id).maybeSingle()
      if (!gym?.id) {
        return secureJson({ error: "Forbidden" }, { status: 403 })
      }
    } else if (role !== "admin") {
      return secureJson({ error: "Forbidden" }, { status: 403 })
    }

    let query = supabase.from("members").select("*").eq("gym_id", gymId)
    if (status && status !== "all") query = query.eq("membership_status", status)
    if (level) query = query.eq("current_level", level)
    if (goal) query = query.eq("goal", goal)
    const { data, error } = await query.order("created_at", { ascending: false })
    if (error) return secureJson({ error: "Failed to fetch members" }, { status: 500 })
    return secureJson({ members: data || [] })
  } catch {
    return secureJson({ error: "Failed to fetch members" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/members")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const {
      gymId,
      durationMonths,
      startDate,
      trainerId,
      monthlyFee,
      email,
    } = body
    const validated = validateBody(MemberAddSchema, {
      fullName: body.fullName,
      phone: body.phone,
      email: body.email,
      duration: Number(durationMonths || 1),
      goal: body.goal,
      level: body.level,
    })
    if (!validated.ok) return validated.response
    const { fullName, phone, goal, level } = validated.data

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: crypto.randomUUID(),
        full_name: sanitizeText(fullName),
        phone: sanitizeText(phone),
        role: "member",
      })
      .select("*")
      .single()
    if (profileError) return secureJson({ error: "Failed to create profile" }, { status: 500 })

    const start = new Date(startDate || new Date())
    const expiry = new Date(start)
    expiry.setMonth(expiry.getMonth() + Number(durationMonths || 1))
    const { data: member, error: memberError } = await supabase
      .from("members")
      .insert({
        profile_id: profile.id,
        gym_id: gymId,
        trainer_id: trainerId || null,
        goal: goal || "muscle_gain",
        current_level: level || "beginner",
        join_date: start.toISOString().slice(0, 10),
        expiry_date: expiry.toISOString().slice(0, 10),
        membership_status: "active",
        medical_conditions: email ? `Email: ${sanitizeText(email)}` : null,
        body_type: monthlyFee ? `Monthly fee Rs ${sanitizeText(String(monthlyFee))}` : null,
      } as any)
      .select("*")
      .single()
    if (memberError) return secureJson({ error: "Failed to create member" }, { status: 500 })

    return secureJson({ profile, member })
  } catch {
    return secureJson({ error: "Failed to add member" }, { status: 500 })
  }
}
