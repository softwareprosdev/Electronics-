// Rate limiter for form submission and auth endpoints.
//
// In-memory buckets work for local development and single-instance Docker
// deployments, but are unreliable on serverless platforms (Vercel): each
// function invocation can run in a fresh process with its own memory, so a
// per-process Map never actually enforces a shared limit across requests.
// When UPSTASH_REDIS_REST_URL/TOKEN are configured, this uses a real
// shared Redis-backed counter instead; otherwise it falls back to the
// in-memory bucket (documented limitation: only effective per-process).

const buckets = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

function inMemoryRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: limit - 1, resetAt: now + windowMs }
  }

  if (bucket.count >= limit) {
    return { success: false, remaining: 0, resetAt: bucket.resetAt }
  }

  bucket.count += 1
  return { success: true, remaining: limit - bucket.count, resetAt: bucket.resetAt }
}

function isUpstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
}

async function redisRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): Promise<RateLimitResult> {
  const url = process.env.UPSTASH_REDIS_REST_URL!
  const token = process.env.UPSTASH_REDIS_REST_TOKEN!
  const bucketKey = `ratelimit:${key}`

  const response = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify([
      ['INCR', bucketKey],
      // NX: only set the TTL on the first hit in a window, so subsequent
      // increments don't keep pushing the window back. Atomic alongside
      // the INCR above since both run in the same pipeline call.
      ['PEXPIRE', bucketKey, String(windowMs), 'NX'],
    ]),
  })

  if (!response.ok) {
    throw new Error(`Upstash rate limit request failed with status ${response.status}`)
  }

  const [incrResult] = (await response.json()) as [{ result: number }, { result: number }]
  const count = incrResult.result
  const resetAt = Date.now() + windowMs

  if (count > limit) {
    return { success: false, remaining: 0, resetAt }
  }

  return { success: true, remaining: Math.max(0, limit - count), resetAt }
}

export async function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
): Promise<RateLimitResult> {
  if (isUpstashConfigured()) {
    try {
      return await redisRateLimit(key, limit, windowMs)
    } catch (error) {
      // Fail open rather than blocking all traffic if the rate-limit
      // backend itself is unreachable; fall back to the in-memory bucket
      // for this request so the endpoint stays protected as best-effort.
      console.error('Upstash rate limit request errored; falling back to in-memory', error)
    }
  }

  return inMemoryRateLimit(key, limit, windowMs)
}

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || 'unknown'
}
