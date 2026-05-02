import { secureJson } from "@/lib/security/api"

export async function GET() {
  return secureJson({
    status: "ok",
    app: "IronIQ",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
    features: ["ai-workout", "voice-coach", "nutrition", "admin", "billing"],
  })
}