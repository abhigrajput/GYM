export const dynamic = "force-dynamic"

import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { JoinGymButton } from "./join-gym-button"

export default async function JoinGymPage({ params }: { params: { code: string } }) {
  const supabase = await createClient()
  const code = params.code?.toUpperCase() || ""
  const { data: gym } = await supabase
    .from("gyms")
    .select("id, name, city, address, gym_code, subscription_status")
    .eq("gym_code", code)
    .in("subscription_status", ["active", "trial"])
    .maybeSingle()

  const { count: memberCount } = gym
    ? await supabase.from("members").select("*", { count: "exact", head: true }).eq("gym_id", gym.id)
    : { count: 0 }

  if (!gym) {
    return (
      <main className="mesh-bg flex min-h-screen items-center justify-center p-4">
        <GlassCard className="max-w-md p-8 text-center">
          <h1 className="font-heading text-xl font-bold">Code invalid</h1>
          <p className="mt-2 text-sm text-white/55">Gym nahi mila. Dubara try karo.</p>
          <Link href="/signup" className="mt-6 inline-block">
            <GradientButton>Signup</GradientButton>
          </Link>
        </GlassCard>
      </main>
    )
  }

  return (
    <main className="mesh-bg min-h-screen p-4 py-16">
      <div className="mx-auto max-w-lg">
        <GlassCard className="p-8" glow="purple">
          <p className="text-xs uppercase tracking-wider text-violet-300">Gym join</p>
          <h1 className="font-heading mt-2 text-3xl font-bold text-white">{gym.name}</h1>
          <p className="mt-1 text-white/60">
            {gym.city} {gym.address ? `· ${gym.address}` : ""}
          </p>
          <p className="mt-4 text-sm text-white/45">~{memberCount || 0} members</p>
          <p className="mt-2 font-mono text-lg text-cyan-300">Code: {gym.gym_code}</p>
          <div className="mt-8">
            <JoinGymButton gymId={gym.id} />
          </div>
        </GlassCard>
      </div>
    </main>
  )
}
