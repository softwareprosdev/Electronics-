import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'
import { getClientKey, rateLimit } from '@/lib/rate-limit'

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: z.string().min(12).max(200),
})

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const clientKey = getClientKey(request)
  const limit = await rateLimit(`admin-password-change:${session.sub}:${clientKey}`, {
    limit: 5,
    windowMs: 10 * 60_000,
  })
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

  const parsed = passwordSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'New password must be at least 12 characters.' },
      { status: 400 },
    )
  }

  const { currentPassword, newPassword } = parsed.data

  const user = await prisma.user.findUnique({ where: { id: session.sub } })
  if (!user) {
    return NextResponse.json({ error: 'Account not found.' }, { status: 404 })
  }

  const currentMatches = await bcrypt.compare(currentPassword, user.passwordHash)
  if (!currentMatches) {
    return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 401 })
  }

  const newHash = await bcrypt.hash(newPassword, 12)
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: newHash } })

  await prisma.auditLog.create({
    data: { actorId: user.id, action: 'CHANGE_PASSWORD', entityType: 'User', entityId: user.id },
  })

  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
