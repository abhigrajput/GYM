export type UserRole = "member" | "owner" | "trainer" | "admin"
export type FitnessGoal = "fat_loss" | "muscle_gain" | "strength" | "endurance" | "aesthetics"
export type FitnessLevel = "beginner" | "intermediate" | "advanced"
export type MembershipStatus = "active" | "expired" | "paused" | "trial"
export type EquipmentCategory = "free_weights" | "machines" | "cardio" | "cables" | "bodyweight" | "other"

export type Profile = {
  id: string
  full_name: string
  phone: string | null
  role: UserRole
  avatar_url: string | null
  city: string | null
  state: string | null
  created_at: string | null
  updated_at: string | null
}

export type GymChain = {
  id: string
  name: string
  owner_id: string | null
  created_at: string | null
}

export type GymSubscriptionStatus = "trial" | "active" | "expired"

export type Gym = {
  id: string
  chain_id: string | null
  owner_id: string | null
  name: string
  address: string | null
  city: string
  state: string | null
  phone: string | null
  whatsapp: string | null
  monthly_fee: number | null
  is_active: boolean | null
  ai_optimized_badge: boolean | null
  created_at: string | null
  updated_at: string | null
  gym_code?: string | null
  subscription_status?: GymSubscriptionStatus | string | null
  subscription_plan?: string | null
  trial_ends_at?: string | null
  razorpay_subscription_id?: string | null
}

export type Equipment = {
  id: string
  gym_id: string | null
  name: string
  category: EquipmentCategory
  quantity: number | null
  is_functional: boolean | null
  notes: string | null
  created_at: string | null
}

export type WorkoutEnvironment = "gym" | "home" | "outdoor" | "any"
export type LanguagePreference = "en" | "hi" | "kn" | "mr"

export type Member = {
  id: string
  profile_id: string | null
  gym_id: string | null
  trainer_id: string | null
  membership_status: MembershipStatus | null
  join_date: string | null
  expiry_date: string | null
  goal: FitnessGoal | null
  current_level: FitnessLevel | null
  body_weight: number | null
  height: number | null
  age: number | null
  body_type: string | null
  days_per_week: number | null
  has_injuries: boolean | null
  injury_notes: string | null
  medical_conditions: string | null
  streak_count: number | null
  last_workout_date: string | null
  created_at: string | null
  updated_at: string | null
  workout_environment?: WorkoutEnvironment | string | null
  home_equipment?: string[] | null
  language_preference?: LanguagePreference | string | null
}

export type WorkoutPlanJSON = {
  weeks: number
  days_per_week: number
  days: {
    day: string
    muscle_groups: string[]
    exercises: {
      name: string
      sets: number
      reps: string
      rest_seconds: number
      equipment_required: string
      substitution?: string
      hinglish_tip?: string
    }[]
  }[]
}

export type WorkoutPlan = {
  id: string
  member_id: string | null
  gym_id: string | null
  level: FitnessLevel
  goal: FitnessGoal
  plan_name: string | null
  plan_json: WorkoutPlanJSON
  equipment_used: string[] | null
  week_number: number | null
  is_active: boolean | null
  ai_generated: boolean | null
  trainer_override: boolean | null
  trainer_notes: string | null
  created_at: string | null
  valid_until: string | null
}

export type WorkoutLog = {
  id: string
  member_id: string | null
  plan_id: string | null
  workout_date: string | null
  exercises_json: Record<string, unknown>
  duration_minutes: number | null
  notes: string | null
  mood: number | null
  completed: boolean | null
  created_at: string | null
}

export type BodyMeasurement = {
  id: string
  member_id: string | null
  measured_at: string | null
  weight: number | null
  chest: number | null
  waist: number | null
  hips: number | null
  left_arm: number | null
  right_arm: number | null
  left_thigh: number | null
  right_thigh: number | null
  body_fat_estimate: number | null
  photo_url: string | null
  notes: string | null
  created_at: string | null
}

export type Attendance = {
  id: string
  member_id: string | null
  gym_id: string | null
  checked_in_at: string | null
  checked_out_at: string | null
  date: string | null
}

export type EquipmentSchedule = {
  id: string
  gym_id: string | null
  equipment_id: string | null
  member_id: string | null
  scheduled_date: string
  time_slot: string
  duration_minutes: number | null
  created_at: string | null
}

export type Notification = {
  id: string
  user_id: string | null
  title: string
  message: string
  type: string | null
  read: boolean | null
  created_at: string | null
}
