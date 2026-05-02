export const dynamic = "force-dynamic"

import { createClient } from "@/lib/supabase/server"
import { OwnerBillingClient } from "./owner-billing-client"

export default async function OwnerBillingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: gym } = await supabase.from("gyms").select("*").eq("owner_id", user.id).maybeSingle()

  const { data: subs } = gym
    ? await supabase.from("subscriptions").select("*").eq("gym_id", gym.id).order("created_at", { ascending: false })
    : { data: [] as Record<string, unknown>[] }

  return (
    <OwnerBillingClient
      gym={gym}
      subscriptions={subs || []}
    />
  )
}
