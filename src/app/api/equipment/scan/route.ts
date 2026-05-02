export const dynamic = "force-dynamic"

import { anthropic, MODELS } from "@/lib/ai/claude"
import { secureJson, enforceRateLimit, requireUser } from "@/lib/security/api"

type EquipmentItem = {
  name: string
  category: "free_weights" | "machines" | "cardio" | "cables" | "bodyweight" | "other"
  quantity: number
  confidence: "high" | "medium" | "low"
}

const SYSTEM_PROMPT =
  "You are an expert gym equipment identifier. Analyze the image and return ONLY a JSON array of equipment found. Each item: { name: string, category: 'free_weights'|'machines'|'cardio'|'cables'|'bodyweight'|'other', quantity: number, confidence: 'high'|'medium'|'low' }. Be specific: 'Flat Bench' not 'Bench'. 'Dumbbell Rack 5-40kg' not 'Dumbbells'. Only include gym equipment you can clearly see. Return raw JSON only, no markdown."

export async function POST(request: Request) {
  try {
    const limited = enforceRateLimit(request, "/api/equipment/scan")
    if (limited) return limited
    const { user } = await requireUser()
    if (!user) return secureJson({ error: "Unauthorized" }, { status: 401 })

    const formData = await request.formData()
    const file = formData.get("image")

    if (!file || !(file instanceof File)) {
      return secureJson({ error: "Image file is required." }, { status: 400 })
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) {
      return secureJson({ error: "Only jpeg/png/webp are allowed." }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString("base64")

    const message = await anthropic.messages.create({
      model: MODELS.SONNET,
      max_tokens: 2000,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: file.type,
                data: base64,
              },
            },
            { type: "text", text: "Identify all visible gym equipment." },
          ],
        },
      ],
    } as any)

    const text = (message.content || [])
      .filter((c: any) => c.type === "text")
      .map((c: any) => c.text)
      .join("\n")
      .trim()

    const parsed = JSON.parse(text) as EquipmentItem[]
    if (!Array.isArray(parsed)) throw new Error("Invalid response format")

    return secureJson({ equipment: parsed })
  } catch {
    return secureJson({ error: "Failed to scan equipment image." }, { status: 500 })
  }
}
