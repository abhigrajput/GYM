export const dynamic = "force-dynamic"

import crypto from "crypto"
import { createServiceRoleClient } from "@/lib/db/connection-pool"
import { secureJson } from "@/lib/security/api"

export async function POST(request: Request) {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET
    const bodyText = await request.text()
    const sig = request.headers.get("x-razorpay-signature")

    if (secret && sig) {
      const expected = crypto.createHmac("sha256", secret).update(bodyText).digest("hex")
      if (expected !== sig) {
        return secureJson({ error: "Invalid signature" }, { status: 400 })
      }
    }

    const payload = JSON.parse(bodyText) as { event?: string; payload?: { subscription?: { entity?: { id?: string } } } }
    const event = payload.event
    const subId = payload.payload?.subscription?.entity?.id

    if (!subId) {
      return secureJson({ ok: true, ignored: true })
    }

    const db = createServiceRoleClient()

    if (event === "subscription.activated" || event === "subscription.charged") {
      await db.from("gyms").update({ subscription_status: "active" }).eq("razorpay_subscription_id", subId)
    }
    if (event === "subscription.cancelled" || event === "subscription.completed") {
      await db.from("gyms").update({ subscription_status: "expired" }).eq("razorpay_subscription_id", subId)
    }

    return secureJson({ ok: true })
  } catch {
    return secureJson({ error: "Webhook failed" }, { status: 500 })
  }
}
