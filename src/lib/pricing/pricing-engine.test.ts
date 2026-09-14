import { describe, expect, it } from 'vitest'
import { recommendPrice, solvePriceForMargin } from './pricing-engine'
import { DEFAULT_PRICING_RULE, type PricingRuleConfig, type PricingRequest } from './types'

const baseRule: PricingRuleConfig = {
  ...DEFAULT_PRICING_RULE,
  warrantyReservePercent: 0,
  overheadAllocationPercent: 0,
}

function baseRequest(overrides: Partial<PricingRequest> = {}): PricingRequest {
  return {
    repairCategory: 'ps5-motherboard-repair',
    costInputs: {
      partsCostCents: 5000,
      laborHours: 1,
      technicianHourlyCostCents: 10000,
      shippingCostCents: 2000,
    },
    rule: baseRule,
    riskLevel: 'LOW',
    ...overrides,
  }
}

describe('solvePriceForMargin', () => {
  it('matches the worked example from PRICING_ENGINE.md: $459.03 floor at 60% margin', () => {
    // parts $50 + labor $100 + shipping $20 = $170 fixed cost, 60% margin, 2.9%+$0.30 processing
    const floor = solvePriceForMargin(17000, 0.6, baseRule)
    expect(floor).toBe(45903)
  })

  it('throws when the configured margin + payment percent is infeasible (>= 100%)', () => {
    expect(() => solvePriceForMargin(1000, 0.99, baseRule)).toThrow(/infeasible/i)
  })
})

describe('recommendPrice', () => {
  it('reproduces the worked example floor price end-to-end', () => {
    const result = recommendPrice(
      baseRequest({ rule: { ...baseRule, minimumMarginPercent: 0.6, targetMarginPercent: 0.6 } }),
    )
    expect(result.priceFloorCents).toBe(45903)
    expect(result.recommendedPriceCents).toBe(45903)
  })

  it('never recommends a price below the floor', () => {
    const result = recommendPrice(baseRequest())
    expect(result.recommendedPriceCents).toBeGreaterThanOrEqual(result.priceFloorCents)
  })

  it('computes gross margin at or above the minimum margin', () => {
    const result = recommendPrice(baseRequest())
    expect(result.grossMarginPercent).toBeGreaterThanOrEqual(baseRule.minimumMarginPercent - 1e-6)
  })

  it('applies the rush multiplier to increase the recommended price', () => {
    const normal = recommendPrice(baseRequest())
    const rushed = recommendPrice(baseRequest({ isRush: true }))
    expect(rushed.recommendedPriceCents).toBeGreaterThan(normal.recommendedPriceCents)
  })

  it('applies complexity score to increase the recommended price', () => {
    const normal = recommendPrice(baseRequest())
    const complex = recommendPrice(baseRequest({ complexityScore: 1 }))
    expect(complex.recommendedPriceCents).toBeGreaterThan(normal.recommendedPriceCents)
  })

  it('flags HIGH risk, requires diagnostic fee, and forces human approval', () => {
    const result = recommendPrice(baseRequest({ riskLevel: 'HIGH' }))
    expect(result.riskFlags).toContain('HIGH_RISK')
    expect(result.priceAction).toBe('REQUIRE_DIAGNOSTIC_FEE')
    expect(result.requiresHumanApproval).toBe(true)
    expect(result.confidence).toBeLessThanOrEqual(0.4)
  })

  it('never fabricates a competitive price when no market data is supplied', () => {
    const result = recommendPrice(baseRequest())
    expect(result.competitivePriceCents).toBeNull()
    expect(result.riskFlags).toContain('NO_MARKET_DATA')
    expect(result.confidence).toBeLessThanOrEqual(0.5)
  })

  it('computes a competitive price as the median of supplied market observations', () => {
    const result = recommendPrice(
      baseRequest({
        marketObservations: [
          { priceCents: 40000, source: 'test', observedAt: '2026-01-01' },
          { priceCents: 50000, source: 'test', observedAt: '2026-01-01' },
          { priceCents: 60000, source: 'test', observedAt: '2026-01-01' },
        ],
      }),
    )
    expect(result.competitivePriceCents).toBe(50000)
    expect(result.riskFlags).not.toContain('NO_MARKET_DATA')
  })

  it('flags insufficient history and uses a capped-confidence heuristic without historical data', () => {
    const result = recommendPrice(baseRequest())
    expect(result.riskFlags).toContain('INSUFFICIENT_HISTORY')
    expect(result.confidence).toBeLessThanOrEqual(0.5)
    expect(result.estimatedAcceptanceProbability).toBeGreaterThan(0)
    expect(result.estimatedAcceptanceProbability).toBeLessThanOrEqual(1)
  })

  it('uses empirical acceptance rate once enough historical quotes exist', () => {
    const result = recommendPrice(
      baseRequest({ historicalAcceptance: { accepted: 8, quoted: 10 } }),
    )
    expect(result.estimatedAcceptanceProbability).toBeCloseTo(0.8)
    expect(result.riskFlags).not.toContain('INSUFFICIENT_HISTORY')
  })

  it('recommends DECREASE when historical acceptance is very low', () => {
    const result = recommendPrice(
      baseRequest({ historicalAcceptance: { accepted: 1, quoted: 10 } }),
    )
    expect(result.priceAction).toBe('DECREASE')
  })

  it('pushes low-priority work toward the premium price when capacity is constrained', () => {
    const uncapacitated = recommendPrice(baseRequest())
    const capacitated = recommendPrice(
      baseRequest({ technicianCapacityPercent: 95, isLowPriority: true }),
    )
    expect(capacitated.recommendedPriceCents).toBeGreaterThan(uncapacitated.recommendedPriceCents)
    expect(capacitated.riskFlags).toContain('CAPACITY_CONSTRAINED')
    expect(capacitated.recommendedPriceCents).toBeLessThanOrEqual(capacitated.maxJustifiedPriceCents)
  })

  it('allows recommended price to drift toward (never below) the floor when capacity is underutilized', () => {
    const normal = recommendPrice(baseRequest())
    const underutilized = recommendPrice(baseRequest({ technicianCapacityPercent: 20 }))
    expect(underutilized.recommendedPriceCents).toBeLessThanOrEqual(normal.recommendedPriceCents)
    expect(underutilized.recommendedPriceCents).toBeGreaterThanOrEqual(underutilized.priceFloorCents)
    expect(underutilized.riskFlags).toContain('UNDERUTILIZED_CAPACITY')
  })

  it('returns null profit-per-technician-hour when laborHours is 0', () => {
    const result = recommendPrice(
      baseRequest({ costInputs: { partsCostCents: 1000, laborHours: 0 } }),
    )
    expect(result.profitPerTechnicianHourCents).toBeNull()
  })

  it('requires human approval when the manual review override is set, even for a clean case', () => {
    const result = recommendPrice(
      baseRequest({ rule: { ...baseRule, manualReviewOverride: true } }),
    )
    expect(result.requiresHumanApproval).toBe(true)
  })

  it('produces non-empty, human-readable reasoning for every recommendation', () => {
    const result = recommendPrice(baseRequest())
    expect(result.reasoning.length).toBeGreaterThan(0)
    for (const line of result.reasoning) {
      expect(typeof line).toBe('string')
      expect(line.length).toBeGreaterThan(0)
    }
  })
})
