import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isTrustedOrigin } from '@/lib/csrf'
import { PRICING_VIEW_ROLES, requireRole } from '@/lib/rbac'

const reviewSchema = z.object({
  action: z.enum(['APPROVE', 'REJECT', 'EDIT']),
  finalPriceCents: z.number().int().min(0).max(100_000_00).optional(),
  reviewNote: z.string().max(2000).optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const auth = await requireRole(PRICING_VIEW_ROLES)
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

  const parsed = reviewSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten() }, { status: 400 })
  }
  const { action, finalPriceCents, reviewNote } = parsed.data

  if (action === 'EDIT' && finalPriceCents === undefined) {
    return NextResponse.json({ error: 'finalPriceCents is required when action is EDIT.' }, { status: 400 })
  }

  const existing = await prisma.pricingRecommendation.findUnique({ where: { id } })
  if (!existing) {
    return NextResponse.json({ error: 'Recommendation not found.' }, { status: 404 })
  }
  if (existing.status !== 'PENDING_REVIEW') {
    return NextResponse.json({ error: `Recommendation is already ${existing.status}.` }, { status: 409 })
  }

  const statusMap = { APPROVE: 'APPROVED', REJECT: 'REJECTED', EDIT: 'EDITED' } as const

  const updated = await prisma.pricingRecommendation.update({
    where: { id },
    data: {
      status: statusMap[action],
      finalPriceCents: action === 'EDIT' ? finalPriceCents : action === 'APPROVE' ? existing.recommendedPriceCents : null,
      reviewedById: auth.session.sub,
      reviewedAt: new Date(),
      reviewNote: reviewNote ?? null,
    },
  })

  await prisma.auditLog.create({
    data: {
      actorId: auth.session.sub,
      action: `PRICING_RECOMMENDATION_${action}`,
      entityType: 'PricingRecommendation',
      entityId: id,
      metadata: { finalPriceCents: updated.finalPriceCents, reviewNote },
    },
  })

  return NextResponse.json({ recommendation: updated }, { headers: { 'Cache-Control': 'no-store' } })
}
