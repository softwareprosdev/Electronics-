import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isTrustedOrigin } from '@/lib/csrf'
import { MARKETING_APPROVE_ROLES, requireRole } from '@/lib/rbac'

const updateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNote: z.string().max(1000).optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const auth = await requireRole(MARKETING_APPROVE_ROLES)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }

  try {
    const draft = await prisma.marketingDraft.update({
      where: { id },
      data: {
        status: parsed.data.status,
        reviewedById: auth.session.sub,
        reviewedAt: new Date(),
        reviewNote: parsed.data.reviewNote,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: auth.session.sub,
        action: parsed.data.status === 'APPROVED' ? 'APPROVE_MARKETING_DRAFT' : 'REJECT_MARKETING_DRAFT',
        entityType: 'MarketingDraft',
        entityId: draft.id,
      },
    })

    // Approving a draft records the human's decision — it does not, by
    // itself, execute anything. Executing a CAMPAIGN_LAUNCH/BUDGET_CHANGE
    // against a live ad platform, or an AD_CREATIVE/SOCIAL_POST against a
    // live social account, requires that platform's credentials, which are
    // not configured in this environment (see /docs/AGENT_SPECIFICATIONS.md).

    return NextResponse.json({ success: true, draft }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Failed to update marketing draft', error)
    return NextResponse.json({ error: 'Draft not found.' }, { status: 404 })
  }
}
