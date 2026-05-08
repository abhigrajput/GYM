export const dynamic = "force-dynamic"

import Razorpay from "razorpay"
import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/billing/create-subscription")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const gymId = body.gymId as string | undefined
    const plan = (body.plan as string) || "pro"
    if (!gymId) return secureJson({ error: "gymId required" }, { status: 400 })

    const { data: gym } = await supabase.from("gyms").select("id, owner_id").eq("id", gymId).maybeSingle()
    if (!gym || gym.owner_id !== user.id) {
      return secureJson({ error: "Forbidden" }, { status: 403 })
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET
    if (!keyId || !keySecret) {
      return secureJson({ error: "Billing not configured", paymentLink: null }, { status: 501 })
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })

    const sub = await razorpay.subscriptions.create({
      plan_id: process.env.RAZORPAY_PLAN_ID || "plan_monthly",
      customer_notify: 1,
      total_count: 120,
      quantity: 1,
    })

    await supabase.from("gyms").update({ razorpay_subscription_id: sub.id }).eq("id", gymId)

    const paymentLink = `https://razorpay.com/subscriptions/${sub.id}/pay`

    return secureJson({
      subscription_id: sub.id,
      payment_link: paymentLink,
      plan,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Billing error"
    return secureJson({ error: msg }, { status: 500 })
  }
}
