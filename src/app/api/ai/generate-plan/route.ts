export const dynamic = "force-dynamic"

import { anthropic, MODELS } from "@/lib/ai/claude"
import { sanitizeText } from "@/lib/security/sanitize"
import { GeneratePlanSchema } from "@/lib/security/validation"
import { secureJson, enforceRateLimit, requireUser, validateBody } from "@/lib/security/api"
import { createServiceRoleClient } from "@/lib/db/connection-pool"

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/ai/generate-plan")
    if (limited) return limited
    const { user, supabase } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const body = await request.json()
    const validated = validateBody(GeneratePlanSchema, body)
    if (!validated.ok) return validated.response
    const { memberId, gymId, level, goal, daysPerWeek, injuries, equipment } = validated.data

    const equipmentList = equipment.map((item) => `${item.name} (${item.quantity})`).join(", ")
    const systemPrompt = `You are IronIQ, an expert Indian gym coach. Generate a ${level} level workout plan for ${goal} goal.
  
  STRICT RULES:
  1. ONLY use equipment from this list: ${equipmentList}
  2. If equipment for an exercise is unavailable, provide a substitution using available equipment
  3. For injuries: ${sanitizeText(injuries || "none")} — avoid all exercises that stress these areas
  4. Plan must be ${daysPerWeek} days per week
  5. Each exercise must include a hinglish_tip field with a short coaching cue in plain English (max 15 words)
  6. Beginners: 3-4 sets, 10-15 reps, compound movements first
  7. Intermediate: 4 sets, 8-12 reps, add isolation work
  8. Advanced: 4-5 sets, 6-12 reps, periodization techniques
  
  Return ONLY this JSON structure, no markdown:
  {
    plan_name: string,
    weeks: 4,
    days_per_week: number,
    days: [
      {
        day_number: number,
        day_name: string,
        muscle_groups: string[],
        warmup: { exercise: string, duration: string }[],
        exercises: [
          {
            name: string,
            sets: number,
            reps: string,
            rest_seconds: number,
            equipment_required: string,
            substitution: string,
            hinglish_tip: string
          }
        ],
        cooldown: { exercise: string, duration: string }[]
      }
    ]
  }`

    const message = await anthropic.messages.create({
      model: MODELS.SONNET,
      max_tokens: 4000,
      system: systemPrompt,
      messages: [{ role: "user", content: "Generate the workout plan JSON now." }],
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
        gym_id: gymId ?? null,
        feature: "generate-plan",
        tokens_used: tokensUsed,
        model: "claude-sonnet-4-5",
        cost_estimate: (tokensUsed / 1000) * 0.003,
        created_at: new Date().toISOString(),
      })
    } catch {}

    const { data: savedPlan, error } = await supabase
      .from("workout_plans")
      .insert({
        member_id: memberId,
        gym_id: gymId ?? null,
        level,
        goal,
        plan_name: plan.plan_name,
        plan_json: plan,
        equipment_used: equipment.map((item) => item.name),
        week_number: 1,
        is_active: true,
        ai_generated: true,
      })
      .select("*")
      .single()

    if (error) throw error

    return secureJson({ plan: savedPlan })
  } catch {
    return secureJson({ error: "Failed to generate plan." }, { status: 500 })
  }
}
