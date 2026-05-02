import { readFileSync, existsSync } from "fs"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"

// Load .env.local for scripts (Next.js does this automatically for the app only)
const envPath = resolve(process.cwd(), ".env.local")
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i === -1) continue
    const key = t.slice(0, i).trim()
    let val = t.slice(i + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    if (key && process.env[key] === undefined) process.env[key] = val
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function setupStorage() {
  // Create progress-photos bucket
  const { error: e1 } = await supabase.storage.createBucket("progress-photos", {
    public: false,
    fileSizeLimit: 10485760, // 10MB
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  })
  if (e1 && !e1.message.includes("already exists")) console.error("Photos bucket:", e1.message)
  else console.log("✅ progress-photos bucket ready")

  // Create equipment-scans bucket
  const { error: e2 } = await supabase.storage.createBucket("equipment-scans", {
    public: false,
    fileSizeLimit: 10485760,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
  })
  if (e2 && !e2.message.includes("already exists")) console.error("Scans bucket:", e2.message)
  else console.log("✅ equipment-scans bucket ready")

  console.log("Storage setup complete!")
}

setupStorage()
