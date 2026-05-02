import { secureJson } from "@/lib/security/api"

export async function GET() {
  return secureJson({
    status: "ok",
    app: "IronIQ",
    timestamp: new Date().toISOString(),
  })
}
