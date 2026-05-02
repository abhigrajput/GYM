-- Run in Supabase SQL Editor after reviewing (additions to existing schema)

-- Add admin role to user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'admin';

-- Add workout_environment to members
ALTER TABLE members ADD COLUMN IF NOT EXISTS workout_environment TEXT DEFAULT 'gym' CHECK (workout_environment IN ('gym', 'home', 'outdoor', 'any'));
ALTER TABLE members ADD COLUMN IF NOT EXISTS home_equipment TEXT[] DEFAULT '{}';
ALTER TABLE members ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'hi', 'kn', 'mr'));

-- Add gym_code to gyms (6 char unique code for members to join)
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS gym_code TEXT UNIQUE;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'expired'));
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'starter';
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '14 days';
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT;

-- AI usage tracking for admin panel
CREATE TABLE IF NOT EXISTS ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id),
  gym_id UUID REFERENCES gyms(id),
  feature TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  model TEXT,
  cost_estimate DECIMAL(10,6) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Platform revenue tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'pro',
  amount INTEGER NOT NULL DEFAULT 2000,
  status TEXT DEFAULT 'active',
  razorpay_sub_id TEXT,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generate gym codes function
CREATE OR REPLACE FUNCTION generate_gym_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate gym code on insert
CREATE OR REPLACE FUNCTION set_gym_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.gym_code IS NULL THEN
    LOOP
      NEW.gym_code := generate_gym_code();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM gyms WHERE gym_code = NEW.gym_code);
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_set_gym_code ON gyms;
CREATE TRIGGER trigger_set_gym_code
  BEFORE INSERT ON gyms
  FOR EACH ROW EXECUTE FUNCTION set_gym_code();

-- RLS for new tables
ALTER TABLE ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin sees all ai logs" ON ai_usage_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users see own ai logs" ON ai_usage_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users insert own ai logs" ON ai_usage_logs FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin sees all subscriptions" ON subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Owners see own subscription" ON subscriptions FOR SELECT USING (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);

-- Allow owners to insert trial subscription for own gym
CREATE POLICY "Owners insert subscription for own gym" ON subscriptions FOR INSERT WITH CHECK (
  gym_id IN (SELECT id FROM gyms WHERE owner_id = auth.uid())
);
