import { createClient } from "@/lib/supabase/server"
import type { Attendance, Equipment, Gym, Member, WorkoutLog, WorkoutPlan } from "@/lib/db/types"

export async function getGymByOwnerId(ownerId: string): Promise<Gym[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("gyms")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as Gym[]
}

export async function getEquipmentByGymId(gymId: string): Promise<Equipment[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("equipment")
    .select("*")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as Equipment[]
}

export async function getMembersByGymId(gymId: string): Promise<Member[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("gym_id", gymId)
    .order("created_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as Member[]
}

export async function getMemberByProfileId(profileId: string): Promise<Member | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("members")
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle()

  if (error) throw error
  return (data as Member | null) ?? null
}

export async function getActiveWorkoutPlan(memberId: string): Promise<WorkoutPlan | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("workout_plans")
    .select("*")
    .eq("member_id", memberId)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .maybeSingle()

  if (error) throw error
  return (data as WorkoutPlan | null) ?? null
}

export async function logWorkout(data: Partial<WorkoutLog>): Promise<WorkoutLog> {
  const supabase = await createClient()
  const { data: inserted, error } = await supabase
    .from("workout_logs")
    .insert(data)
    .select("*")
    .single()

  if (error) throw error
  return inserted as WorkoutLog
}

export async function getAttendanceByGym(gymId: string, date: string): Promise<Attendance[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("attendance")
    .select("*")
    .eq("gym_id", gymId)
    .eq("date", date)
    .order("checked_in_at", { ascending: false })

  if (error) throw error
  return (data ?? []) as Attendance[]
}

export async function updateMemberStreak(memberId: string): Promise<Member | null> {
  const supabase = await createClient()
  const { data: existing, error: readError } = await supabase
    .from("members")
    .select("streak_count,last_workout_date")
    .eq("id", memberId)
    .maybeSingle()

  if (readError) throw readError
  if (!existing) return null

  const today = new Date()
  const todayISO = today.toISOString().slice(0, 10)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const yesterdayISO = yesterday.toISOString().slice(0, 10)

  const lastWorkoutDate = existing.last_workout_date as string | null
  const currentStreak = (existing.streak_count as number | null) ?? 0

  let nextStreak = currentStreak
  if (lastWorkoutDate === todayISO) {
    nextStreak = currentStreak
  } else if (lastWorkoutDate === yesterdayISO) {
    nextStreak = currentStreak + 1
  } else {
    nextStreak = 1
  }

  const { data: updated, error: updateError } = await supabase
    .from("members")
    .update({ streak_count: nextStreak, last_workout_date: todayISO })
    .eq("id", memberId)
    .select("*")
    .maybeSingle()

  if (updateError) throw updateError
  return (updated as Member | null) ?? null
}
