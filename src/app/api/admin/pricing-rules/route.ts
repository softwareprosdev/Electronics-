import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isTrustedOrigin } from '@/lib/csrf'
import { PRICING_RULE_EDIT_ROLES, PRICING_VIEW_ROLES, requireRole } from '@/lib/rbac'
import { loadOrCreatePricingRule } from '@/lib/pricing-rule-store'

export async function GET() {
  const auth = await requireRole(PRICING_VIEW_ROLES)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const rule = await loadOrCreatePricingRule()
  return NextResponse.json({ rule }, { headers: { 'Cache-Control': 'no-store' } })
}

const updateSchema = z.object({
  minimumMarginPercent: z.number().min(0).max(0.95),
  targetMarginPercent: z.number().min(0).max(0.95),
  minimumDiagnosticFeeCents: z.number().int().min(0).max(100_000_00),
  minimumRepairPriceCents: z.number().int().min(0).max(100_000_00),
  maximumDiscountPercent: z.number().min(0).max(1),
  rushMultiplier: z.number().min(1).max(5),
  complexityMultiplierMax: z.number().min(1).max(5),
  riskMultiplierMax: z.number().min(1).max(5),
  premiumFactor: z.number().min(1).max(5),
  maximumJustifiedMultiplier: z.number().min(1).max(10),
  warrantyReservePercent: z.number().min(0).max(1),
  overheadAllocationPercent: z.number().min(0).max(1),
  paymentProcessingPercent: z.number().min(0).max(0.5),
  paymentProcessingFixedCents: z.number().int().min(0).max(10_000),
  technicianHourlyCostCents: z.number().int().min(0).max(1_000_00),
  capacityHighThresholdPercent: z.number().min(0).max(2),
  capacityLowThresholdPercent: z.number().min(0).max(2),
  approvalConfidenceThreshold: z.number().min(0).max(1),
  manualReviewOverride: z.boolean(),
})

export async function PUT(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const auth = await requireRole(PRICING_RULE_EDIT_ROLES)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten() }, { status: 400 })
  }

  if (parsed.data.minimumMarginPercent + parsed.data.paymentProcessingPercent >= 1) {
    return NextResponse.json(
      { error: 'minimumMarginPercent + paymentProcessingPercent must be less than 1 (an unsolvable floor price).' },
      { status: 400 },
    )
  }

  await loadOrCreatePricingRule()
  const updated = await prisma.pricingRule.update({
    where: { key: 'global' },
    data: { ...parsed.data, updatedById: auth.session.sub },
  })

  await prisma.auditLog.create({
    data: {
      actorId: auth.session.sub,
      action: 'UPDATE_PRICING_RULE',
      entityType: 'PricingRule',
      entityId: updated.id,
      metadata: { ...parsed.data },
    },
  })

  return NextResponse.json({ rule: updated }, { headers: { 'Cache-Control': 'no-store' } })
}
