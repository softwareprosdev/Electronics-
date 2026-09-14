import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ADMIN_SESSION_COOKIE, adminSessionCookieOptions, createAdminSessionToken } from '@/lib/auth'
import { getClientKey, rateLimit } from '@/lib/rate-limit'
import { isTrustedOrigin } from '@/lib/csrf'

const loginSchema = z.object({
  email: z.string().trim().email().max(200),
  password: z.string().min(1).max(200),
})

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const clientKey = getClientKey(request)
  const limit = await rateLimit(`admin-login:${clientKey}`, { limit: 8, windowMs: 10 * 60_000 })
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again shortly.' },
      { status: 429, headers: { 'Cache-Control': 'no-store' } },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = loginSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  const { email, password } = parsed.data

  const user = await prisma.user.findUnique({ where: { email } })
  const genericError = NextResponse.json(
    { error: 'Invalid email or password.' },
    { status: 401, headers: { 'Cache-Control': 'no-store' } },
  )

  // Always run a bcrypt comparison, even for a nonexistent/inactive user,
  // against a fixed dummy hash — otherwise the early return makes this
  // endpoint measurably faster for unknown emails than for known ones,
  // letting an attacker enumerate valid admin accounts via response timing.
  const DUMMY_HASH = '$2a$12$CwTycUXWue0Thq9StjUM0uJ8Dl0lHEMbP5UYo5U/Sc.8v6yqNJa6.'
  const passwordMatches = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_HASH)

  if (!user || !user.isActive || !passwordMatches) {
    return genericError
  }

  const token = await createAdminSessionToken({ sub: user.id, email: user.email, role: user.role })

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  await prisma.auditLog.create({
    data: { actorId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id },
  })

  const response = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions)
  return response
}
