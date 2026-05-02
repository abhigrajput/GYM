"use client"

import { EquipmentScanner } from "@/features/equipment-scanner/components/EquipmentScanner"
import { GymFinder } from "@/features/gym-finder/components/GymFinder"
import { PlanGenerator } from "@/features/workout-planner/components/PlanGenerator"
import { WorkoutPlanView } from "@/features/workout-planner/components/WorkoutPlanView"
import { GlassCard } from "@/components/ui/glass-card"
import { GradientButton } from "@/components/ui/gradient-button"
import { StatCard } from "@/components/ui/stat-card"
import type { Gym, Member, Profile } from "@/lib/db/types"
import { motion } from "framer-motion"
import { Bell, Flame } from "lucide-react"
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
  const name = profile?.full_name?.split(" ")[0] || "Friend"
  const streak = member?.streak_count ?? 0
  const hasGym = Boolean(member?.gym_id)
  const equipCount = equipment?.length ?? 0
  const soloTraining =
    Boolean(member) &&
    !member!.gym_id &&
    member!.workout_environment &&
    member!.workout_environment !== "gym"

  const moodEmoji = (n: number | null) => {
    if (n === null || n === undefined) return "💪"
    if (n >= 4) return "🔥"
    if (n >= 2) return "😊"
    return "😐"
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] p-4 sm:p-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">
            Kya haal hai, {name}! <span className="inline-block animate-pulse">💪</span>
          </h1>
          <p className="mt-1 text-sm text-white/50">{profile?.city || "Bharat"}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm text-amber-200">
            <Flame className="h-4 w-4" />
            {streak} din streak
          </div>
          <button type="button" className="rounded-full border border-white/10 p-2 text-white/60 hover:bg-white/5" aria-label="Notifications">
            <Bell className="h-5 w-5" />
          </button>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500" />
        </div>
      </div>

      {!member ? (
        <GlassCard className="p-6">Member profile missing — complete signup.</GlassCard>
      ) : soloTraining && !plan ? (
        <div>
          <PlanGenerator
            memberId={member.id}
            gymId={null}
            equipment={(member.home_equipment && member.home_equipment.length > 0
              ? member.home_equipment
              : ["Bodyweight"]
            ).map((name) => ({ name, category: "bodyweight", quantity: 1 }))}
            onGenerated={() => {}}
          />
        </div>
      ) : !hasGym && !soloTraining ? (
        <div className="space-y-6">
          <GlassCard className="p-6" glow="purple">
            <h2 className="font-heading text-xl font-semibold text-white">Gym dhundo ya ghar pe workout karo</h2>
            <p className="mt-2 text-sm text-white/60">Search, code, ya solo training — tumhari choice.</p>
          </GlassCard>
          <GymFinder memberId={member.id} />
        </div>
      ) : hasGym && equipCount === 0 ? (
        <div>
          <h2 className="mb-3 font-heading text-lg text-white">Gym equipment setup</h2>
          <EquipmentScanner gymId={member.gym_id!} />
        </div>
      ) : hasGym && equipCount > 0 && !plan ? (
        <div>
          <PlanGenerator
            memberId={member.id}
            gymId={member.gym_id}
            equipment={equipment as { name: string; category: string; quantity: number }[]}
            onGenerated={() => {}}
          />
        </div>
      ) : plan ? (
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="gradient-border rounded-2xl p-[1px]">
              <GlassCard className="border-0 p-6 shadow-none" animate={false} glow="cyan">
                <p className="text-xs uppercase tracking-wider text-cyan-200/80">Aaj ka workout</p>
                <h3 className="mt-2 font-heading text-2xl text-white">
                  {(plan.plan_json as { days?: { day_name?: string; day?: string }[] })?.days?.[0]?.day_name ||
                    (plan.plan_json as { days?: { day?: string }[] })?.days?.[0]?.day ||
                    "Push Day"}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(((plan.plan_json as { days?: { muscle_groups?: string[] }[] })?.days?.[0]?.muscle_groups ||
                    []) as string[]).map((m: string) => (
                    <span key={m} className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-100">
                      {m}
                    </span>
                  ))}
                </div>
                <Link href="/member/workout">
                  <GradientButton className="mt-6 w-full sm:w-auto">Start Karo</GradientButton>
                </Link>
              </GlassCard>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard title="Level" value={(member.current_level || "beginner").toString()} glow="purple" />
            <StatCard title="Weekly progress" value="On track" change="+2" changeType="up" glow="cyan" />
            <StatCard title="Streak" value={streak} suffix=" days" glow="pink" />
            <StatCard
              title="Body weight"
              value={member.body_weight ?? "—"}
              suffix={member.body_weight ? " kg" : ""}
              glow="none"
            />
          </div>

          <GlassCard className="p-5" glow="purple">
            <h3 className="font-heading text-lg text-white">Full plan</h3>
            <div className="mt-4">
              <WorkoutPlanView plan={plan} memberId={member.id} />
            </div>
          </GlassCard>

          <GlassCard className="p-5">
            <h3 className="font-heading text-lg text-white">Recent workouts</h3>
            <div className="mt-4 space-y-3">
              {logs.length === 0 ? (
                <p className="text-sm text-white/50">Abhi koi log nahi — pehla workout shuru karo!</p>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-center justify-between border-l-2 border-violet-500/50 py-2 pl-4"
                  >
                    <div>
                      <p className="text-sm text-white">{log.workout_date || "—"}</p>
                      <p className="text-xs text-white/40">{log.duration_minutes ?? 0} min</p>
                    </div>
                    <span className="text-xl">{moodEmoji(log.mood)}</span>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      ) : (
        <GlassCard className="p-6">Loading dashboard…</GlassCard>
      )}
    </div>
  )
}
