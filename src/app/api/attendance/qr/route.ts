export const dynamic = "force-dynamic"

import { createHmac } from "crypto"
import QRCode from "qrcode"
import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

export async function GET(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/attendance/qr")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })
    const { searchParams } = new URL(request.url)
    const memberId = searchParams.get("memberId")
    if (!memberId) return secureJson({ error: "memberId required" }, { status: 400 })

    const { data: member } = await supabase.from("members").select("id,gym_id").eq("id", memberId).maybeSingle()
    if (!member) return secureJson({ error: "Member not found" }, { status: 404 })

    const timestamp = Date.now()
    const payload = `${memberId}:${timestamp}`
    const signature = createHmac("sha256", process.env.QR_HMAC_SECRET || "dev-secret").update(payload).digest("hex")
    const qrData = { memberId, gymId: member.gym_id, timestamp, signature }
    const qrText = JSON.stringify(qrData)
    const image = await QRCode.toDataURL(qrText)
    return secureJson({ qrData, qrImageBase64: image })
  } catch {
    return secureJson({ error: "Failed to generate QR." }, { status: 500 })
  }
}
