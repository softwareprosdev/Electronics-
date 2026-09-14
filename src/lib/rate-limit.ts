// Lightweight in-memory rate limiter for form submission endpoints.
// For multi-instance production deployments, swap this for an
// Upstash Redis-backed limiter using UPSTASH_REDIS_REST_URL/TOKEN.

const buckets = new Map<string, { count: number; resetAt: number }>()

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  { limit = 5, windowMs = 60_000 }: { limit?: number; windowMs?: number } = {},
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

export function getClientKey(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for')
  return forwardedFor?.split(',')[0]?.trim() || 'unknown'
}
