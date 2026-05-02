-- IronIQ realistic Indian seed data

-- 1 chain
INSERT INTO gym_chains (id, name)
VALUES ('11111111-1111-1111-1111-111111111111', 'FitBharat Gyms')
ON CONFLICT (id) DO NOTHING;

-- 2 gyms
INSERT INTO gyms (id, chain_id, name, city, state, monthly_fee, is_active, ai_optimized_badge)
VALUES
  ('22222222-2222-2222-2222-222222222221', '11111111-1111-1111-1111-111111111111', 'FitBharat Dharwad', 'Dharwad', 'Karnataka', 799, true, true),
  ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'FitBharat Nagpur', 'Nagpur', 'Maharashtra', 899, true, true)
ON CONFLICT (id) DO NOTHING;

-- Dharwad equipment
INSERT INTO equipment (gym_id, name, category, quantity, is_functional, notes)
VALUES
  ('22222222-2222-2222-2222-222222222221', 'Flat Bench', 'machines', 2, true, 'Heavy chest days'),
  ('22222222-2222-2222-2222-222222222221', 'Incline Bench', 'machines', 1, true, 'Upper chest focus'),
  ('22222222-2222-2222-2222-222222222221', 'Barbell Set', 'free_weights', 1, true, '20kg olympic bar + plates'),
  ('22222222-2222-2222-2222-222222222221', 'Dumbbell Rack (5-40kg)', 'free_weights', 1, true, 'Pairs from 5kg to 40kg'),
  ('22222222-2222-2222-2222-222222222221', 'Squat Rack', 'machines', 1, true, 'Power rack'),
  ('22222222-2222-2222-2222-222222222221', 'Lat Pulldown Machine', 'machines', 1, true, 'Wide and close grip bars'),
  ('22222222-2222-2222-2222-222222222221', 'Cable Crossover', 'cables', 1, true, 'Dual adjustable pulleys'),
  ('22222222-2222-2222-2222-222222222221', 'Treadmill', 'cardio', 2, true, 'Incline supported'),
  ('22222222-2222-2222-2222-222222222221', 'Pull-up Bar', 'bodyweight', 2, true, 'Wall mounted');

-- Nagpur equipment
INSERT INTO equipment (gym_id, name, category, quantity, is_functional, notes)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'Dumbbell Rack (5-30kg)', 'free_weights', 1, true, 'Pairs from 5kg to 30kg'),
  ('22222222-2222-2222-2222-222222222222', 'Flat Bench', 'machines', 1, true, 'Main bench setup'),
  ('22222222-2222-2222-2222-222222222222', 'Barbell Set', 'free_weights', 1, true, 'Standard olympic setup'),
  ('22222222-2222-2222-2222-222222222222', 'Smith Machine', 'machines', 1, true, 'Guided bar path'),
  ('22222222-2222-2222-2222-222222222222', 'Leg Press Machine', 'machines', 1, true, '45 degree leg press'),
  ('22222222-2222-2222-2222-222222222222', 'Treadmill', 'cardio', 1, true, 'General cardio'),
  ('22222222-2222-2222-2222-222222222222', 'Pull-up Bar', 'bodyweight', 1, true, 'Freestanding');

-- 3 members in Dharwad
INSERT INTO members (id, gym_id, profile_id, membership_status, goal, current_level, age, body_weight, height, days_per_week, has_injuries, streak_count)
VALUES
  ('33333333-3333-3333-3333-333333333331', '22222222-2222-2222-2222-222222222221', NULL, 'active', 'muscle_gain', 'intermediate', 26, 72.5, 173, 5, false, 6),
  ('33333333-3333-3333-3333-333333333332', '22222222-2222-2222-2222-222222222221', NULL, 'trial', 'fat_loss', 'beginner', 24, 64.2, 162, 4, false, 2),
  ('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222221', NULL, 'active', 'strength', 'advanced', 29, 81.0, 178, 6, false, 11)
ON CONFLICT (id) DO NOTHING;

-- 3 members in Nagpur
INSERT INTO members (id, gym_id, profile_id, membership_status, goal, current_level, age, body_weight, height, days_per_week, has_injuries, streak_count)
VALUES
  ('33333333-3333-3333-3333-333333333334', '22222222-2222-2222-2222-222222222222', NULL, 'active', 'endurance', 'intermediate', 27, 58.3, 160, 5, false, 8),
  ('33333333-3333-3333-3333-333333333335', '22222222-2222-2222-2222-222222222222', NULL, 'expired', 'aesthetics', 'beginner', 31, 78.4, 176, 3, false, 0),
  ('33333333-3333-3333-3333-333333333336', '22222222-2222-2222-2222-222222222222', NULL, 'trial', 'muscle_gain', 'beginner', 22, 55.0, 158, 4, false, 1)
ON CONFLICT (id) DO NOTHING;

-- Names mapped for app-side joins when profiles are added:
-- Rahul Sharma, Priya Nair, Arjun Patil, Sneha Desai, Vikram Rao, Meena Kulkarni
