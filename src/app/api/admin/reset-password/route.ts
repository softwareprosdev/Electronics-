import { NextResponse } from 'next/server'
import { createHash } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isTrustedOrigin } from '@/lib/csrf'
import { getClientKey, rateLimit } from '@/lib/rate-limit'
import { hashPassword } from '@/lib/password'

export const runtime = 'nodejs'

const schema = z.object({
  token: z.string().trim().min(1).max(500),
  newPassword: z.string().min(12).max(200),
})

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const clientKey = getClientKey(request)
  const limit = await rateLimit(`admin-reset-password:${clientKey}`, {
    limit: 10,
    windowMs: 15 * 60_000,
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

  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'New password must be at least 12 characters.' },
      { status: 400 },
    )
  }

  const { token, newPassword } = parsed.data
  const tokenHash = createHash('sha256').update(token).digest('hex')

  const user = await prisma.user.findUnique({ where: { passwordResetTokenHash: tokenHash } })

  if (!user || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date()) {
    return NextResponse.json(
      { error: 'This reset link is invalid or has expired. Request a new one.' },
      { status: 400 },
    )
  }

  const newHash = await hashPassword(newPassword)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash: newHash,
      passwordResetTokenHash: null,
      passwordResetExpiresAt: null,
    },
  })

  await prisma.auditLog.create({
    data: { actorId: user.id, action: 'RESET_PASSWORD', entityType: 'User', entityId: user.id },
  })

  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
}
