import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { ADMIN_SESSION_COOKIE, adminSessionCookieOptions, createAdminSessionToken } from '@/lib/auth'
import { getClientKey, rateLimit } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(1),
})

export async function POST(request: Request) {
  const clientKey = getClientKey(request)
  const limit = rateLimit(`admin-login:${clientKey}`, { limit: 8, windowMs: 10 * 60_000 })
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many attempts. Please try again shortly.' }, { status: 429 })
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
  const genericError = NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 })

  if (!user || !user.isActive) {
    return genericError
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash)
  if (!passwordMatches) {
    return genericError
  }

  const token = await createAdminSessionToken({ sub: user.id, email: user.email, role: user.role })

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } })
  await prisma.auditLog.create({
    data: { actorId: user.id, action: 'LOGIN', entityType: 'User', entityId: user.id },
  })

  const response = NextResponse.json({ success: true })
  response.cookies.set(ADMIN_SESSION_COOKIE, token, adminSessionCookieOptions)
  return response
}
