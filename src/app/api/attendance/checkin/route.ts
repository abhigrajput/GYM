export const dynamic = "force-dynamic"

import { createHmac } from "crypto"
import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/attendance/checkin")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const { qrData } = await request.json()
    if (!qrData?.memberId || !qrData?.timestamp || !qrData?.signature) {
      return secureJson({ error: "Invalid QR payload" }, { status: 400 })
    }

    const now = Date.now()
    if (now - Number(qrData.timestamp) > 5 * 60 * 1000) {
      return secureJson({ error: "QR expired" }, { status: 400 })
    }

    const payload = `${qrData.memberId}:${qrData.timestamp}`
    const expected = createHmac("sha256", process.env.QR_HMAC_SECRET || "dev-secret").update(payload).digest("hex")
    if (expected !== qrData.signature) return secureJson({ error: "Invalid QR signature" }, { status: 400 })

    const { data: member } = await supabase.from("members").select("*").eq("id", qrData.memberId).maybeSingle()
    if (!member) return secureJson({ error: "Member not found" }, { status: 404 })

    const checkInTime = new Date().toISOString()
    await supabase.from("attendance").insert({
      member_id: member.id,
      gym_id: member.gym_id,
      checked_in_at: checkInTime,
      date: checkInTime.slice(0, 10),
    })

    const today = checkInTime.slice(0, 10)
    const y = new Date()
    y.setDate(y.getDate() - 1)
    const yesterday = y.toISOString().slice(0, 10)
    let streak = Number(member.streak_count || 0)
    if (member.last_workout_date === today) streak = streak
    else if (member.last_workout_date === yesterday) streak += 1
    else streak = 1
    await supabase.from("members").update({ streak_count: streak, last_workout_date: today }).eq("id", member.id)

    const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", member.profile_id).maybeSingle()
    return secureJson({
      success: true,
      memberName: profile?.full_name || "Member",
      checkInTime,
      streakCount: streak,
    })
  } catch {
    return secureJson({ error: "Check-in failed" }, { status: 500 })
  }
}
