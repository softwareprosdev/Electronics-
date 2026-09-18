import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isTrustedOrigin } from '@/lib/csrf'
import { rateLimit } from '@/lib/rate-limit'
import { PRICING_VIEW_ROLES, requireRole } from '@/lib/rbac'
import { loadPricingRuleConfig } from '@/lib/pricing-rule-store'
import { runPricingOrchestrator } from '@/lib/agents/orchestrator'
import type { PricingRequest, RiskLevel } from '@/lib/pricing/types'

const costInputsSchema = z.object({
  partsCostCents: z.number().int().min(0).max(100_000_00),
  laborHours: z.number().min(0).max(200),
  diagnosticHours: z.number().min(0).max(50).optional(),
  shippingCostCents: z.number().int().min(0).max(100_000_00).optional(),
  consumablesCostCents: z.number().int().min(0).max(100_000_00).optional(),
  technicianHourlyCostCents: z.number().int().min(0).max(100_000_00).optional(),
})

const recommendSchema = z.object({
  repairCategorySlug: z.string().min(1).max(150).optional(),
  repairCategoryLabel: z.string().min(1).max(200).optional(),
  repairId: z.string().min(1).max(64).optional(),
  costInputs: costInputsSchema,
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  complexityScore: z.number().min(0).max(1).optional(),
  isRush: z.boolean().optional(),
  isLowPriority: z.boolean().optional(),
  technicianCapacityPercent: z.number().min(0).max(200).optional(),
  symptomText: z.string().max(4000).optional(),
})

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const auth = await requireRole(PRICING_VIEW_ROLES)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  // Keyed by user, not IP: these are authenticated internal endpoints, and
  // per-user limiting also bounds AI spend per user per window.
  const rateLimitResult = await rateLimit(`pricing-recommend:${auth.session.sub}`, {
    limit: 20,
    windowMs: 60_000,
  })
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests. Please slow down.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = recommendSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten() }, { status: 400 })
  }
  const input = parsed.data

  if (!input.repairCategorySlug && !input.repairCategoryLabel) {
    return NextResponse.json(
      { error: 'Either repairCategorySlug or repairCategoryLabel is required.' },
      { status: 400 },
    )
  }

  let repairCategoryId: string | undefined
  let repairCategoryLabel = input.repairCategoryLabel
  let riskLevel: RiskLevel | undefined = input.riskLevel

  if (input.repairCategorySlug) {
    const category = await prisma.repairCategory.findUnique({ where: { slug: input.repairCategorySlug } })
    if (!category || !category.isActive) {
      return NextResponse.json({ error: 'Unknown or inactive repair category.' }, { status: 404 })
    }
    repairCategoryId = category.id
    repairCategoryLabel = category.name
    riskLevel = riskLevel ?? (category.riskLevel as RiskLevel)
  }

  const rule = await loadPricingRuleConfig()

  const pricingRequest: PricingRequest = {
    repairCategory: repairCategoryLabel ?? input.repairCategorySlug!,
    costInputs: input.costInputs,
    rule,
    riskLevel,
    complexityScore: input.complexityScore,
    isRush: input.isRush,
    isLowPriority: input.isLowPriority,
    technicianCapacityPercent: input.technicianCapacityPercent,
  }

  try {
    const result = await runPricingOrchestrator({
      pricingRequest,
      repairCategoryId,
      repairId: input.repairId,
      symptomText: input.symptomText,
    })

    return NextResponse.json(
      {
        recommendationId: result.recommendationId,
        recommendation: result.recommendation,
        aiNarrative: result.aiNarrative,
        aiRiskFlags: result.aiRiskFlags,
      },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    console.error('Pricing recommendation failed', error)
    return NextResponse.json({ error: 'Failed to generate a pricing recommendation.' }, { status: 500 })
  }
}
