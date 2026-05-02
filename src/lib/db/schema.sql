-- ─── EXTENSIONS ───────────────────────────────────────────
enable uuid-ossp extension if not already enabled

-- ─── ENUMS ────────────────────────────────────────────────
CREATE TYPE user_role AS ENUM ('member', 'owner', 'trainer');
CREATE TYPE fitness_goal AS ENUM ('fat_loss', 'muscle_gain', 'strength', 'endurance', 'aesthetics');
CREATE TYPE fitness_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'paused', 'trial');
CREATE TYPE equipment_category AS ENUM ('free_weights', 'machines', 'cardio', 'cables', 'bodyweight', 'other');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- ─── PROFILES ─────────────────────────────────────────────
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'member',
  avatar_url TEXT,
  city TEXT,
  state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── GYM CHAINS (for multi-branch support) ────────────────
CREATE TABLE gym_chains (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── GYMS ─────────────────────────────────────────────────
CREATE TABLE gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chain_id UUID REFERENCES gym_chains(id),
  owner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  city TEXT NOT NULL,
  state TEXT,
  phone TEXT,
  whatsapp TEXT,
  monthly_fee INTEGER DEFAULT 500,
  is_active BOOLEAN DEFAULT true,
  ai_optimized_badge BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── EQUIPMENT ────────────────────────────────────────────
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category equipment_category NOT NULL,
  quantity INTEGER DEFAULT 1,
  is_functional BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── MEMBERS ──────────────────────────────────────────────
CREATE TABLE members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  trainer_id UUID REFERENCES profiles(id),
  membership_status membership_status DEFAULT 'trial',
  join_date DATE DEFAULT CURRENT_DATE,
  expiry_date DATE,
  goal fitness_goal DEFAULT 'muscle_gain',
  current_level fitness_level DEFAULT 'beginner',
  body_weight DECIMAL(5,2),
  height DECIMAL(5,2),
  age INTEGER,
  body_type TEXT,
  days_per_week INTEGER DEFAULT 4,
  has_injuries BOOLEAN DEFAULT false,
  injury_notes TEXT,
  medical_conditions TEXT,
  streak_count INTEGER DEFAULT 0,
  last_workout_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── WORKOUT PLANS ────────────────────────────────────────
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id),
  level fitness_level NOT NULL,
  goal fitness_goal NOT NULL,
  plan_name TEXT,
  plan_json JSONB NOT NULL,
  equipment_used TEXT[],
  week_number INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  ai_generated BOOLEAN DEFAULT true,
  trainer_override BOOLEAN DEFAULT false,
  trainer_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  valid_until DATE
);

-- ─── WORKOUT LOGS ─────────────────────────────────────────
CREATE TABLE workout_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES workout_plans(id),
  workout_date DATE DEFAULT CURRENT_DATE,
  exercises_json JSONB NOT NULL,
  duration_minutes INTEGER,
  notes TEXT,
  mood INTEGER CHECK (mood BETWEEN 1 AND 5),
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── BODY MEASUREMENTS ────────────────────────────────────
CREATE TABLE body_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  measured_at DATE DEFAULT CURRENT_DATE,
  weight DECIMAL(5,2),
  chest DECIMAL(5,2),
  waist DECIMAL(5,2),
  hips DECIMAL(5,2),
  left_arm DECIMAL(5,2),
  right_arm DECIMAL(5,2),
  left_thigh DECIMAL(5,2),
  right_thigh DECIMAL(5,2),
  body_fat_estimate DECIMAL(4,2),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── ATTENDANCE ───────────────────────────────────────────
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMPTZ DEFAULT NOW(),
  checked_out_at TIMESTAMPTZ,
  date DATE DEFAULT CURRENT_DATE
);

-- ─── EQUIPMENT SCHEDULES (Traffic Management) ─────────────
CREATE TABLE equipment_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  equipment_id UUID REFERENCES equipment(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  time_slot TEXT NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── NOTIFICATIONS ────────────────────────────────────────
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── INDEXES ──────────────────────────────────────────────
CREATE INDEX idx_members_gym ON members(gym_id);
CREATE INDEX idx_members_profile ON members(profile_id);
CREATE INDEX idx_equipment_gym ON equipment(gym_id);
CREATE INDEX idx_workout_logs_member ON workout_logs(member_id);
CREATE INDEX idx_workout_logs_date ON workout_logs(workout_date);
CREATE INDEX idx_attendance_member ON attendance(member_id);
CREATE INDEX idx_attendance_gym_date ON attendance(gym_id, date);
CREATE INDEX idx_workout_plans_member ON workout_plans(member_id);

-- ─── ROW LEVEL SECURITY ───────────────────────────────────

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Gyms: owners manage their own gyms, members can view gyms they belong to
CREATE POLICY "Owners manage own gyms" ON gyms FOR ALL USING (auth.uid() = owner_id);
CREATE POLICY "Members view their gym" ON gyms FOR SELECT USING (
  id IN (SELECT gym_id FROM members WHERE profile_id = auth.uid())
);

-- Equipment: owners manage, members of that gym can view
CREATE POLICY "Owners manage equipment" ON equipment FOR ALL USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);
CREATE POLICY "Members view gym equipment" ON equipment FOR SELECT USING (
  gym_id IN (SELECT gym_id FROM members WHERE profile_id = auth.uid())
);

-- Members: owners see their gym members, members see own record
CREATE POLICY "Owners view gym members" ON members FOR SELECT USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);
CREATE POLICY "Members view own record" ON members FOR SELECT USING (profile_id = auth.uid());
CREATE POLICY "Members update own record" ON members FOR UPDATE USING (profile_id = auth.uid());

-- Workout plans: member sees own, owner sees gym members
CREATE POLICY "Members view own plans" ON workout_plans FOR SELECT USING (
  member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
);
CREATE POLICY "Owners view gym plans" ON workout_plans FOR SELECT USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);

-- Workout logs: members manage own logs
CREATE POLICY "Members manage own logs" ON workout_logs FOR ALL USING (
  member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
);

-- Body measurements: members manage own
CREATE POLICY "Members manage own measurements" ON body_measurements FOR ALL USING (
  member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
);

-- Attendance: members see own, owners see gym attendance
CREATE POLICY "Members view own attendance" ON attendance FOR SELECT USING (
  member_id IN (SELECT id FROM members WHERE profile_id = auth.uid())
);
CREATE POLICY "Owners view gym attendance" ON attendance FOR SELECT USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);

-- Notifications: users see own only
CREATE POLICY "Users view own notifications" ON notifications FOR ALL USING (auth.uid() = user_id);

-- ─── AUTO-UPDATE TIMESTAMPS ───────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members FOR EACH ROW EXECUTE FUNCTION update_updated_at();
