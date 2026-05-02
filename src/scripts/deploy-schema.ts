import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function deploySchema() {
  const schemaPath = path.join(process.cwd(), 'src/lib/db/schema.sql')
  const sql = fs.readFileSync(schemaPath, 'utf-8')
  console.log('Deploying IronIQ schema to Supabase...')
  const { error } = await supabase.rpc('exec_sql', { sql })
  if (error) {
    console.error('Schema deploy error:', error.message)
  } else {
    console.log('Schema deployed successfully.')
  }
}

deploySchema()
