export const dynamic = "force-dynamic"

import { sanitizeText, sanitizeNumber } from "@/lib/security/sanitize"
import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/whatsapp/reminder")
    if (limited) return limited
    const { user } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })
    const { type, name, date, link, days } = await request.json()
    let message = ""

    if (type === "welcome_message") {
      message = `Welcome ${sanitizeText(name)}. You are now active on IronIQ. Your dashboard is ready: ${sanitizeText(link)}`
    } else if (type === "renewal_reminder") {
      message = `${sanitizeText(name)}, your membership expires on ${sanitizeText(date)}. Renew now: ${sanitizeText(link)}`
    } else if (type === "dropout_reengagement") {
      message = `${sanitizeText(name)}, you have been inactive for ${sanitizeNumber(days) || 0} days. Return today. Your plan is waiting.`
    } else {
      return secureJson({ error: "Invalid reminder type" }, { status: 400 })
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    return secureJson({ waUrl, message })
  } catch {
    return secureJson({ error: "Failed to generate reminder" }, { status: 500 })
  }
}
