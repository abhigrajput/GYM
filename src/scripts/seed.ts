import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  const seedPath = path.join(process.cwd(), "src/lib/db/seed.sql")
  const sql = fs.readFileSync(seedPath, "utf-8")
  console.log("Running IronIQ seed...")
  const { error } = await supabase.rpc("exec_sql", { sql })
  if (error) {
    console.error("Seed error:", error.message)
    process.exit(1)
  }
  console.log("Seed completed.")
}

seed()
