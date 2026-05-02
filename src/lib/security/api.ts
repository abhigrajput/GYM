import { NextResponse } from "next/server"
import { ZodSchema } from "zod"
import { createClient } from "@/lib/supabase/server"
import { getDefaultLimit, rateLimit } from "@/lib/security/rateLimit"

const secureHeaders = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
}

export function secureJson(body: unknown, init?: ResponseInit) {
  return NextResponse.json(body, {
    ...(init || {}),
    headers: {
      ...(init?.headers || {}),
      ...secureHeaders,
    },
  })
}

export function getIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
}

export function enforceRateLimit(req: Request, endpoint: string) {
  const ip = getIp(req)
  const rule = getDefaultLimit(endpoint)
  const state = rateLimit(ip, endpoint, rule.max, rule.windowMs)
  if (!state.allowed) {
    return secureJson(
      {
        error: "Rate limit exceeded",
        remaining: state.remaining,
        resetAt: state.resetAt.toISOString(),
      },
      { status: 429 }
    )
  }
  return null
}

export async function requireUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return { supabase, user }
}

export function validateBody<T>(schema: ZodSchema<T>, body: unknown) {
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return {
      ok: false as const,
      response: secureJson(
        { error: "Validation failed", fields: parsed.error.flatten().fieldErrors },
        { status: 400 }
      ),
    }
  }
  return { ok: true as const, data: parsed.data }
}
