type Bucket = {
  count: number
  resetAt: number
}

const store = new Map<string, Bucket>()

const defaults = [
  { pattern: /^\/api\/ai\//, max: 10, windowMs: 60_000 },
  { pattern: /^\/api\/auth\//, max: 5, windowMs: 60_000 },
  { pattern: /^\/api\//, max: 60, windowMs: 60_000 },
]

export function getDefaultLimit(endpoint: string) {
  return defaults.find((r) => r.pattern.test(endpoint)) ?? defaults[2]
}

export function rateLimit(ip: string, endpoint: string, maxRequests: number, windowMs: number) {
  const now = Date.now()
  const key = `${ip}:${endpoint}:${windowMs}:${maxRequests}`
  const bucket = store.get(key)

  if (!bucket || now >= bucket.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return { allowed: true, remaining: maxRequests - 1, resetAt: new Date(resetAt) }
  }

  if (bucket.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: new Date(bucket.resetAt) }
  }

  bucket.count += 1
  store.set(key, bucket)
  return { allowed: true, remaining: Math.max(0, maxRequests - bucket.count), resetAt: new Date(bucket.resetAt) }
}
