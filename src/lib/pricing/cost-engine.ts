// Deterministic cost accounting. Pure functions — no I/O, no LLM.
// See /docs/PRICING_ENGINE.md.

import type { CostBreakdown, CostInputs, PricingRuleConfig } from './types'

function roundToCents(value: number): number {
  return Math.round(value)
}

/**
 * True cost of a repair at a specific candidate sale price. Payment
 * processing is a percentage of price, so cost is a function of price
 * rather than a single fixed number — this must be called once per
 * candidate price point (floor, competitive, recommended, premium).
 */
export function computeCostBreakdown(
  inputs: CostInputs,
  rule: PricingRuleConfig,
  candidatePriceCents: number,
): CostBreakdown {
  if (inputs.partsCostCents < 0) throw new Error('partsCostCents cannot be negative')
  if (inputs.laborHours < 0) throw new Error('laborHours cannot be negative')
  if (candidatePriceCents < 0) throw new Error('candidatePriceCents cannot be negative')

  const hourlyCostCents = inputs.technicianHourlyCostCents ?? rule.technicianHourlyCostCents
  const diagnosticHours = inputs.diagnosticHours ?? 0
  const shippingCostCents = inputs.shippingCostCents ?? 0
  const consumablesCostCents = inputs.consumablesCostCents ?? 0

  const partsCostCents = roundToCents(inputs.partsCostCents)
  const laborCostCents = roundToCents(inputs.laborHours * hourlyCostCents)
  const diagnosticCostCents = roundToCents(diagnosticHours * hourlyCostCents)

  // Warranty reserve and overhead allocation are based on the repair's own
  // labor/parts cost, not on shipping or on price — so they don't create a
  // circular dependency on the price being evaluated.
  const repairCostBaseCents = partsCostCents + laborCostCents + diagnosticCostCents
  const warrantyReserveCents = roundToCents(repairCostBaseCents * rule.warrantyReservePercent)
  const overheadCents = roundToCents(repairCostBaseCents * rule.overheadAllocationPercent)

  const paymentCostCents = roundToCents(
    candidatePriceCents * rule.paymentProcessingPercent + rule.paymentProcessingFixedCents,
  )

  const variableCostCents =
    partsCostCents +
    laborCostCents +
    diagnosticCostCents +
    shippingCostCents +
    consumablesCostCents +
    warrantyReserveCents +
    paymentCostCents

  const trueCostCents = variableCostCents + overheadCents

  return {
    partsCostCents,
    laborCostCents,
    diagnosticCostCents,
    shippingCostCents,
    consumablesCostCents,
    warrantyReserveCents,
    overheadCents,
    paymentCostCents,
    variableCostCents,
    trueCostCents,
  }
}

/**
 * The portion of variable cost that does not depend on the candidate price
 * (everything except the percentage-based payment processing fee). Used by
 * the pricing engine to algebraically solve for a price that hits a target
 * margin, rather than searching for one.
 */
export function computeFixedVariableCostCents(inputs: CostInputs, rule: PricingRuleConfig): number {
  const hourlyCostCents = inputs.technicianHourlyCostCents ?? rule.technicianHourlyCostCents
  const diagnosticHours = inputs.diagnosticHours ?? 0
  const shippingCostCents = inputs.shippingCostCents ?? 0
  const consumablesCostCents = inputs.consumablesCostCents ?? 0

  const partsCostCents = roundToCents(inputs.partsCostCents)
  const laborCostCents = roundToCents(inputs.laborHours * hourlyCostCents)
  const diagnosticCostCents = roundToCents(diagnosticHours * hourlyCostCents)
  const repairCostBaseCents = partsCostCents + laborCostCents + diagnosticCostCents
  const warrantyReserveCents = roundToCents(repairCostBaseCents * rule.warrantyReservePercent)

  return (
    partsCostCents +
    laborCostCents +
    diagnosticCostCents +
    shippingCostCents +
    consumablesCostCents +
    warrantyReserveCents
  )
}

export function computeGrossProfitCents(priceCents: number, breakdown: CostBreakdown): number {
  return priceCents - (breakdown.variableCostCents)
}

export function computeGrossMarginPercent(priceCents: number, breakdown: CostBreakdown): number {
  if (priceCents <= 0) return 0
  return computeGrossProfitCents(priceCents, breakdown) / priceCents
}

export function computeProfitPerTechnicianHourCents(
  grossProfitCents: number,
  laborHours: number,
): number | null {
  if (laborHours <= 0) return null
  return roundToCents(grossProfitCents / laborHours)
}
