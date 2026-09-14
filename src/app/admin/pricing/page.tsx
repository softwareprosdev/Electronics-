import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PRICING_VIEW_ROLES } from '@/lib/rbac'
import { PricingRecommendationForm } from '@/components/admin/PricingRecommendationForm'
import { PricingRecommendationList } from '@/components/admin/PricingRecommendationList'

export const dynamic = 'force-dynamic'

export default async function AdminPricingPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  if (!PRICING_VIEW_ROLES.includes(session.role as (typeof PRICING_VIEW_ROLES)[number])) {
    return (
      <div className="panel p-6">
        <h1 className="text-xl font-bold text-lab-text">Pricing</h1>
        <p className="mt-3 text-sm text-lab-muted">
          Your account role ({session.role}) does not have access to the pricing engine.
        </p>
      </div>
    )
  }

  const [categories, recommendations] = await Promise.all([
    prisma.repairCategory.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        riskLevel: true,
        defaultLaborHours: true,
        defaultDiagnosticHours: true,
        defaultPartsCostCents: true,
      },
    }),
    prisma.pricingRecommendation.findMany({
      include: { repairCategory: { select: { name: true } }, reviewedBy: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
  ])

  const rows = recommendations.map((rec) => ({
    id: rec.id,
    repairCategoryName: rec.repairCategory?.name ?? null,
    createdAt: rec.createdAt.toLocaleString(),
    recommendedPriceCents: rec.recommendedPriceCents,
    priceFloorCents: rec.priceFloorCents,
    premiumPriceCents: rec.premiumPriceCents,
    competitivePriceCents: rec.competitivePriceCents,
    grossMarginPercent: rec.grossMarginPercent,
    profitPerTechnicianHourCents: rec.profitPerTechnicianHourCents,
    confidence: rec.confidence,
    priceAction: rec.priceAction,
    status: rec.status,
    requiresHumanApproval: rec.requiresHumanApproval,
    riskFlags: rec.riskFlags,
    reasoning: rec.reasoning,
    finalPriceCents: rec.finalPriceCents,
    reviewedByName: rec.reviewedBy?.name ?? null,
    reviewNote: rec.reviewNote,
  }))

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-lab-text">AI Pricing &amp; Profit Engine</h1>
        <Link href="/admin/pricing/rules" className="btn-tertiary text-xs">
          Edit Pricing Rules
        </Link>
      </div>
      <p className="max-w-3xl text-sm leading-relaxed text-lab-muted">
        Every number below (floor, recommended, premium price, margin, profit/hour) is computed by
        deterministic code, not the AI model &mdash; see{' '}
        <code className="text-lab-text">/docs/PRICING_ENGINE.md</code>. The AI layer only writes
        the plain-language explanation and classifies risk flags from free-text symptoms.
      </p>

      <PricingRecommendationForm categories={categories} />

      <div>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-lab-muted">
          Recent Recommendations
        </h2>
        <div className="mt-4">
          <PricingRecommendationList recommendations={rows} />
        </div>
      </div>
    </div>
  )
}
