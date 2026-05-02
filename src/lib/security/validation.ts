import { z } from "zod"

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  phone: z.string().regex(/^\+91\d{10}$/),
  role: z.enum(["member", "owner", "trainer"]),
})

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export const EquipmentScanSchema = z.object({
  gymId: z.string().uuid(),
})

export const GeneratePlanSchema = z.object({
  memberId: z.string().uuid(),
  gymId: z.string().uuid().optional().nullable(),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.enum(["fat_loss", "muscle_gain", "strength", "endurance", "aesthetics"]),
  daysPerWeek: z.number().int().min(3).max(6),
  injuries: z.string().optional().default(""),
  equipment: z.array(
    z.object({
      name: z.string().min(1),
      category: z.string().min(1),
      quantity: z.number().int().positive(),
    })
  ),
})

export const MeasurementSchema = z.object({
  weight: z.number().positive(),
  chest: z.number().positive(),
  waist: z.number().positive(),
  arms: z.number().positive(),
})

export const MemberAddSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().regex(/^\+91\d{10}$/),
  email: z.string().email().optional(),
  duration: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]),
  goal: z.enum(["fat_loss", "muscle_gain", "strength", "endurance", "aesthetics"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
})

export const NutritionPlanSchema = z.object({
  memberId: z.string().uuid(),
  goal: z.enum(["fat_loss", "muscle_gain", "strength", "endurance", "aesthetics"]),
  bodyWeight: z.number().positive(),
  isVegetarian: z.boolean(),
  isEggetarian: z.boolean(),
  dailyBudget: z.number().positive(),
  allergies: z.string().optional().default(""),
})
