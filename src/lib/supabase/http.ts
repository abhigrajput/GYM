const RETRIES = 3
const BASE_DELAY_MS = 200
export const FETCH_TIMEOUT_MS = 10_000

async function fetchWithTimeout(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    return await fetch(input, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(t)
  }
}

export async function supabaseFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let lastErr: unknown
  for (let attempt = 0; attempt < RETRIES; attempt++) {
    try {
      return await fetchWithTimeout(input, init)
    } catch (e) {
      lastErr = e
      await new Promise((r) => setTimeout(r, BASE_DELAY_MS * Math.pow(2, attempt)))
    }
  }
  throw lastErr
}
