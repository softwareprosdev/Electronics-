import { describe, expect, it } from 'vitest'
import {
  computeCostBreakdown,
  computeFixedVariableCostCents,
  computeGrossMarginPercent,
  computeGrossProfitCents,
  computeProfitPerTechnicianHourCents,
} from './cost-engine'
import { DEFAULT_PRICING_RULE, type PricingRuleConfig } from './types'

const ruleNoOverheadNoWarranty: PricingRuleConfig = {
  ...DEFAULT_PRICING_RULE,
  warrantyReservePercent: 0,
  overheadAllocationPercent: 0,
  paymentProcessingPercent: 0.029,
  paymentProcessingFixedCents: 30,
}

describe('computeCostBreakdown', () => {
  it('matches the worked example from PRICING_ENGINE.md', () => {
    const breakdown = computeCostBreakdown(
      { partsCostCents: 5000, laborHours: 1, shippingCostCents: 2000, technicianHourlyCostCents: 10000 },
      ruleNoOverheadNoWarranty,
      45903,
    )
    expect(breakdown.partsCostCents).toBe(5000)
    expect(breakdown.laborCostCents).toBe(10000)
    expect(breakdown.shippingCostCents).toBe(2000)
    expect(breakdown.warrantyReserveCents).toBe(0)
    expect(breakdown.overheadCents).toBe(0)
    // 45903 * 0.029 + 30 = 1331.187 + 30 -> rounds to 1361
    expect(breakdown.paymentCostCents).toBe(1361)
    expect(breakdown.variableCostCents).toBe(5000 + 10000 + 2000 + 0 + 1361)
    expect(breakdown.trueCostCents).toBe(breakdown.variableCostCents)
  })

  it('applies warranty reserve and overhead as percentages of parts+labor+diagnostic only', () => {
    const rule: PricingRuleConfig = {
      ...DEFAULT_PRICING_RULE,
      warrantyReservePercent: 0.1,
      overheadAllocationPercent: 0.2,
    }
    const breakdown = computeCostBreakdown(
      { partsCostCents: 1000, laborHours: 0, diagnosticHours: 0 },
      rule,
      0,
    )
    // repairCostBase = 1000 (no labor, no diagnostic)
    expect(breakdown.warrantyReserveCents).toBe(100)
    expect(breakdown.overheadCents).toBe(200)
  })

  it('uses the technician hourly override when provided, otherwise the rule default', () => {
    const withOverride = computeCostBreakdown(
      { partsCostCents: 0, laborHours: 2, technicianHourlyCostCents: 5000 },
      DEFAULT_PRICING_RULE,
      0,
    )
    expect(withOverride.laborCostCents).toBe(10000)

    const withDefault = computeCostBreakdown({ partsCostCents: 0, laborHours: 2 }, DEFAULT_PRICING_RULE, 0)
    expect(withDefault.laborCostCents).toBe(DEFAULT_PRICING_RULE.technicianHourlyCostCents * 2)
  })

  it('rejects negative inputs', () => {
    expect(() =>
      computeCostBreakdown({ partsCostCents: -1, laborHours: 1 }, DEFAULT_PRICING_RULE, 100),
    ).toThrow()
    expect(() =>
      computeCostBreakdown({ partsCostCents: 1, laborHours: -1 }, DEFAULT_PRICING_RULE, 100),
    ).toThrow()
    expect(() =>
      computeCostBreakdown({ partsCostCents: 1, laborHours: 1 }, DEFAULT_PRICING_RULE, -1),
    ).toThrow()
  })
})

describe('computeFixedVariableCostCents', () => {
  it('excludes the price-dependent payment processing fee', () => {
    const fixed = computeFixedVariableCostCents(
      { partsCostCents: 5000, laborHours: 1, shippingCostCents: 2000, technicianHourlyCostCents: 10000 },
      ruleNoOverheadNoWarranty,
    )
    expect(fixed).toBe(17000)
  })
})

describe('gross profit / margin / profit-per-hour', () => {
  it('computes gross profit as price minus variable cost (excluding overhead)', () => {
    const breakdown = computeCostBreakdown(
      { partsCostCents: 1000, laborHours: 1, technicianHourlyCostCents: 1000 },
      { ...DEFAULT_PRICING_RULE, overheadAllocationPercent: 0.5, warrantyReservePercent: 0, paymentProcessingPercent: 0, paymentProcessingFixedCents: 0 },
      5000,
    )
    // variableCost = 1000 + 1000 = 2000 (overhead of 1000 excluded from gross profit)
    expect(breakdown.variableCostCents).toBe(2000)
    expect(breakdown.overheadCents).toBe(1000)
    expect(computeGrossProfitCents(5000, breakdown)).toBe(3000)
    expect(computeGrossMarginPercent(5000, breakdown)).toBeCloseTo(0.6)
  })

  it('returns null profit-per-hour when labor hours is zero (no divide-by-zero)', () => {
    expect(computeProfitPerTechnicianHourCents(10000, 0)).toBeNull()
  })

  it('computes profit per technician hour', () => {
    expect(computeProfitPerTechnicianHourCents(10000, 2)).toBe(5000)
  })

  it('returns 0 margin for a zero price rather than dividing by zero', () => {
    const breakdown = computeCostBreakdown({ partsCostCents: 0, laborHours: 0 }, DEFAULT_PRICING_RULE, 0)
    expect(computeGrossMarginPercent(0, breakdown)).toBe(0)
  })
})
