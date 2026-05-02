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
      message = `Swagat hai bhai! ${sanitizeText(name)} IronIQ gym mein join ho gaye. Aapka plan ready hai: ${sanitizeText(link)}`
    } else if (type === "renewal_reminder") {
      message = `Bhai ${sanitizeText(name)}, aapki membership ${sanitizeText(date)} ko expire ho rahi hai. Renew karo: ${sanitizeText(link)}`
    } else if (type === "dropout_reengagement") {
      message = `Bhai ${sanitizeText(name)}, ${sanitizeNumber(days) || 0} din se gym nahi aaye. Aaj wapas aao 💪 Tumhara plan wait kar raha hai!`
    } else {
      return secureJson({ error: "Invalid reminder type" }, { status: 400 })
    }

    const waUrl = `https://wa.me/?text=${encodeURIComponent(message)}`
    return secureJson({ waUrl, message })
  } catch {
    return secureJson({ error: "Failed to generate reminder" }, { status: 500 })
  }
}
