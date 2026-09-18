import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/auth'
import { PRICING_RULE_EDIT_ROLES, PRICING_VIEW_ROLES } from '@/lib/rbac'
import { loadOrCreatePricingRule } from '@/lib/pricing-rule-store'
import { PricingRuleForm } from '@/components/admin/PricingRuleForm'

export const dynamic = 'force-dynamic'

export default async function AdminPricingRulesPage() {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  if (!PRICING_VIEW_ROLES.includes(session.role as (typeof PRICING_VIEW_ROLES)[number])) {
    return (
      <div className="panel p-6">
        <h1 className="text-xl font-bold text-lab-text">Pricing Rules</h1>
        <p className="mt-3 text-sm text-lab-muted">
          Your account role ({session.role}) does not have access to pricing configuration.
        </p>
      </div>
    )
  }

  const canEdit = PRICING_RULE_EDIT_ROLES.includes(
    session.role as (typeof PRICING_RULE_EDIT_ROLES)[number],
  )
  const rule = await loadOrCreatePricingRule()
  const {
    minimumMarginPercent,
    targetMarginPercent,
    minimumDiagnosticFeeCents,
    minimumRepairPriceCents,
    maximumDiscountPercent,
    rushMultiplier,
    complexityMultiplierMax,
    riskMultiplierMax,
    premiumFactor,
    maximumJustifiedMultiplier,
    warrantyReservePercent,
    overheadAllocationPercent,
    paymentProcessingPercent,
    paymentProcessingFixedCents,
    technicianHourlyCostCents,
    capacityHighThresholdPercent,
    capacityLowThresholdPercent,
    approvalConfidenceThreshold,
    manualReviewOverride,
  } = rule

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-lab-text">Pricing Rules</h1>
      <p className="max-w-3xl text-sm leading-relaxed text-lab-muted">
        These values drive every deterministic pricing calculation &mdash; nothing in the pricing
        engine is hard-coded (source spec §32). Changes apply to every recommendation generated
        after saving.
      </p>
      <PricingRuleForm
        rule={{
          minimumMarginPercent,
          targetMarginPercent,
          minimumDiagnosticFeeCents,
          minimumRepairPriceCents,
          maximumDiscountPercent,
          rushMultiplier,
          complexityMultiplierMax,
          riskMultiplierMax,
          premiumFactor,
          maximumJustifiedMultiplier,
          warrantyReservePercent,
          overheadAllocationPercent,
          paymentProcessingPercent,
          paymentProcessingFixedCents,
          technicianHourlyCostCents,
          capacityHighThresholdPercent,
          capacityLowThresholdPercent,
          approvalConfidenceThreshold,
          manualReviewOverride,
        }}
        readOnly={!canEdit}
      />
    </div>
  )
}
