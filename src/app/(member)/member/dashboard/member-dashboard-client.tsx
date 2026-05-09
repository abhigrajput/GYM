"use client"

import { GymFinder } from "@/features/gym-finder/components/GymFinder"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { StatCard } from "@/components/ui/stat-card"
import type { Gym, Member, Profile } from "@/lib/db/types"
import Link from "next/link"

type LogRow = {
  id: string
  workout_date: string | null
  duration_minutes: number | null
  mood: number | null
  exercises_json?: Record<string, unknown>
}

export function MemberDashboardClient({
  profile,
  member,
  gym,
  equipment,
  plan,
  logs,
}: {
  profile: Profile | null
  member: Member | null
  gym: Gym | null
  equipment: Array<Record<string, unknown>>
  plan: Record<string, unknown> | null
  logs: LogRow[]
}) {
  const name = profile?.full_name?.toUpperCase() || "ATHLETE"
  const streak = member?.streak_count ?? 0
  const hasGym = Boolean(member?.gym_id)
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, ".")
  const plannedDay = ((plan?.plan_json as any)?.days?.[0] || null) as any

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-black p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#00FF41]/20 pb-4">
        <div>
          <h1 className="font-heading text-2xl text-white md:text-3xl">WELCOME BACK, {name}</h1>
          <p className="mt-1 font-mono text-xs text-[#888888]">// {today}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="rounded border border-[#00FF41]/40 px-3 py-1 text-xs text-[#00FF41]">STREAK: {streak} DAYS</div>
          <div className="hidden rounded border border-[#00FF41]/20 px-3 py-1 text-xs text-[#888888] md:block">
            {gym?.name || "NO GYM LINKED"}
          </div>
        </div>
      </div>

      {!member ? (
        <GlassCard className="p-6">Member profile missing — complete signup.</GlassCard>
      ) : !hasGym ? (
        <div className="space-y-6">
          <GlassCard className="p-6">
            <h2 className="font-heading text-lg text-[#00FF41]">&gt; SELECT TRAINING ENVIRONMENT</h2>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <GlassCard className="p-4 text-center"><p className="font-mono text-[#00FF41]">[HOME]</p></GlassCard>
              <GlassCard className="p-4 text-center"><p className="font-mono text-[#00FF41]">[OUTDOOR]</p></GlassCard>
              <GlassCard className="p-4 text-center"><p className="font-mono text-[#00FF41]">[FIND GYM]</p></GlassCard>
            </div>
          </GlassCard>
          <GymFinder memberId={member.id} />
        </div>
      ) : plan ? (
        <div className="space-y-8">
          <GlassCard className="p-6 shadow-[0_0_20px_rgba(0,255,65,0.3)]">
            <p className="font-mono text-xs text-[#888888]">TODAY&apos;S MISSION:</p>
            <h3 className="mt-2 font-heading text-2xl text-[#00FF41]">{plannedDay?.day_name || "TRAINING DAY"}</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {(plannedDay?.muscle_groups || []).map((m: string) => (
                <span key={m} className="border border-[#00FF41]/30 px-2 py-1 text-xs text-[#00FF41]">{m}</span>
              ))}
            </div>
            <div className="mt-4 space-y-1 font-mono text-sm text-[#00FF41]">
              {(plannedDay?.exercises || []).slice(0, 3).map((ex: any) => (
                <p key={ex.name}>&gt; {ex.name}</p>
              ))}
            </div>
            <Link href="/member/workout"><GradientButton className="mt-5 w-full">START WORKOUT</GradientButton></Link>
          </GlassCard>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="LEVEL" value={(member.current_level || "beginner").toString().toUpperCase()} />
            <StatCard title="WEEKLY" value={`${Math.min(4, logs.length)}/4 SESSIONS`} />
            <StatCard title="STREAK" value={`${streak} DAYS`} />
            <StatCard title="WEIGHT" value={member.body_weight ? `${member.body_weight} KG` : "N/A"} />
          </div>
        </div>
      ) : (
        <GlassCard className="p-6">
          <p className="font-mono text-[#00FF41]">No active plan found.</p>
          <Link href="/member/workout"><GradientButton className="mt-3">Generate Plan</GradientButton></Link>
        </GlassCard>
      )}
    </div>
  )
}
