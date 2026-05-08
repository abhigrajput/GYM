export const dynamic = "force-dynamic"

import { anthropic, MODELS } from "@/lib/ai/claude"
import { NutritionPlanSchema } from "@/lib/security/validation"
import { sanitizeText } from "@/lib/security/sanitize"
import { secureJson, enforceRateLimit, requireUser, validateBody } from "@/lib/security/api"
import { createServiceRoleClient } from "@/lib/db/connection-pool"

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/ai/nutrition-plan")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const validated = validateBody(NutritionPlanSchema, body)
    if (!validated.ok) return validated.response
    const { memberId, goal, bodyWeight, isVegetarian, isEggetarian, dailyBudget, allergies } = validated.data
    const { data: member } = await supabase.from("members").select("gym_id").eq("id", memberId).maybeSingle()
    const gymId = member?.gym_id ?? null
    const dietType = isVegetarian ? "Vegetarian" : isEggetarian ? "Eggetarian" : "Non-Vegetarian"
    const prompt = `You are an Indian nutrition expert. Create a daily meal plan for a ${goal} goal person weighing ${bodyWeight}kg.
  Diet type: ${dietType}
  Daily budget: ₹${dailyBudget}
  
  STRICT RULES:
  1. Use ONLY Indian foods: dal, roti, chawal, sabzi, paneer, eggs, chicken, dahi, sprouts, poha, upma, idli, dosa, sattu, etc.
  2. No western foods (no 'chicken breast', 'greek yogurt', 'quinoa')
  3. Calculate realistic macros for Indian food portions
  4. Include pre-workout and post-workout meal timing
  5. All meals in grams/cups as Indians measure
  Allergies: ${sanitizeText(allergies || "none")}
  
  Return ONLY JSON:
  {
    daily_calories: number,
    protein_grams: number,
    carb_grams: number,
    fat_grams: number,
    meals: [
      {
        time: string,
        name: string,
        foods: [{ item: string, quantity: string, calories: number, protein: number }],
        total_calories: number,
        total_protein: number,
        is_pre_workout: boolean,
        is_post_workout: boolean
      }
    ],
    supplement_guide: {
      essential: string[],
      optional: string[],
      avoid: string[],
      scam_warning: string
    }
  }`

    const message = await anthropic.messages.create({
      model: MODELS.SONNET,
      max_tokens: 3000,
      system: prompt,
      messages: [{ role: "user", content: `Generate nutrition plan for member ${memberId}.` }],
    })

    const text = (message.content || [])
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("\n")
      .trim()
    const plan = JSON.parse(text)

    try {
      const tokensUsed = Number((message as any)?.usage?.input_tokens || 0) + Number((message as any)?.usage?.output_tokens || 0)
      const db = createServiceRoleClient()
      await db.from("ai_usage_logs").insert({
        user_id: user.id,
        gym_id: gymId,
        feature: "nutrition-plan",
        tokens_used: tokensUsed,
        model: "claude-sonnet-4-5",
        cost_estimate: (tokensUsed / 1000) * 0.003,
        created_at: new Date().toISOString(),
      })
    } catch {}

    return secureJson({ plan })
  } catch {
    return secureJson({ error: "Failed to generate nutrition plan." }, { status: 500 })
  }
}
