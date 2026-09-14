import { prisma } from '@/lib/prisma'
import type { PricingRule } from '@prisma/client'
import { DEFAULT_PRICING_RULE, type PricingRuleConfig } from './pricing/types'

export function toPricingRuleConfig(rule: PricingRule): PricingRuleConfig {
  return {
    minimumMarginPercent: rule.minimumMarginPercent,
    targetMarginPercent: rule.targetMarginPercent,
    minimumDiagnosticFeeCents: rule.minimumDiagnosticFeeCents,
    minimumRepairPriceCents: rule.minimumRepairPriceCents,
    maximumDiscountPercent: rule.maximumDiscountPercent,
    rushMultiplier: rule.rushMultiplier,
    complexityMultiplierMax: rule.complexityMultiplierMax,
    riskMultiplierMax: rule.riskMultiplierMax,
    premiumFactor: rule.premiumFactor,
    maximumJustifiedMultiplier: rule.maximumJustifiedMultiplier,
    warrantyReservePercent: rule.warrantyReservePercent,
    overheadAllocationPercent: rule.overheadAllocationPercent,
    paymentProcessingPercent: rule.paymentProcessingPercent,
    paymentProcessingFixedCents: rule.paymentProcessingFixedCents,
    technicianHourlyCostCents: rule.technicianHourlyCostCents,
    capacityHighThresholdPercent: rule.capacityHighThresholdPercent,
    capacityLowThresholdPercent: rule.capacityLowThresholdPercent,
    approvalConfidenceThreshold: rule.approvalConfidenceThreshold,
    manualReviewOverride: rule.manualReviewOverride,
  }
}

/** Loads the global pricing rule, creating it with defaults on first use. */
export async function loadOrCreatePricingRule(key = 'global'): Promise<PricingRule> {
  const existing = await prisma.pricingRule.findUnique({ where: { key } })
  if (existing) return existing
  return prisma.pricingRule.create({ data: { key } })
}

export async function loadPricingRuleConfig(key = 'global'): Promise<PricingRuleConfig> {
  const existing = await prisma.pricingRule.findUnique({ where: { key } })
  return existing ? toPricingRuleConfig(existing) : DEFAULT_PRICING_RULE
}
