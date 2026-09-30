import { NextResponse } from 'next/server'
import { randomBytes, createHash } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isTrustedOrigin } from '@/lib/csrf'
import { getClientKey, rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/notify'
import { siteConfig } from '@/lib/site-config'

export const runtime = 'nodejs'

const RESET_TOKEN_TTL_MS = 30 * 60_000

const schema = z.object({
  email: z.string().trim().email().max(200),
})

// Always returns the same generic response regardless of whether the email
// matches an account — otherwise this endpoint becomes an account-existence
// oracle for anyone probing admin emails.
const GENERIC_RESPONSE = NextResponse.json(
  { success: true, message: 'If that account exists, a reset link has been sent.' },
  { headers: { 'Cache-Control': 'no-store' } },
)

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const clientKey = getClientKey(request)
  const limit = await rateLimit(`admin-forgot-password:${clientKey}`, {
    limit: 5,
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
    return GENERIC_RESPONSE
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } })

  if (user && user.isActive) {
    const token = randomBytes(32).toString('hex')
    const tokenHash = createHash('sha256').update(token).digest('hex')

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordResetTokenHash: tokenHash,
        passwordResetExpiresAt: new Date(Date.now() + RESET_TOKEN_TTL_MS),
      },
    })

    const resetUrl = `${siteConfig.url}/admin/reset-password?token=${token}`

    // Sent to the checked internal inbox (INTERNAL_NOTIFY_EMAIL), not the
    // account's own @traceworkslab.com address — that mailbox is exactly
    // what this business had no visibility into, so a reset link sent
    // there would be as invisible as everything else was before that fix.
    await sendEmail({
      to: siteConfig.notifyEmail,
      subject: 'TraceWorks Lab admin password reset',
      body: `A password reset was requested for the admin account ${user.email}. This link expires in 30 minutes and can only be used once: <a href="${resetUrl}">${resetUrl}</a>. If you didn't request this, you can ignore it.`,
    })

    await prisma.auditLog.create({
      data: {
        actorId: user.id,
        action: 'REQUEST_PASSWORD_RESET',
        entityType: 'User',
        entityId: user.id,
      },
    })
  }

  return GENERIC_RESPONSE
}
