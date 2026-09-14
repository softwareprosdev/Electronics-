// Deterministic pricing engine. Pure functions — no I/O, no LLM.
// The LLM is never the source of truth for these numbers; see
// /docs/PRICING_ENGINE.md and /docs/AGENT_SPECIFICATIONS.md.

import {
  computeCostBreakdown,
  computeFixedVariableCostCents,
  computeGrossProfitCents,
  computeGrossMarginPercent,
  computeProfitPerTechnicianHourCents,
} from './cost-engine'
import {
  DEFAULT_PRICING_RULE,
  type HistoricalAcceptance,
  type MarketPriceObservation,
  type PriceAction,
  type PriceRecommendation,
  type PricingRequest,
  type PricingRuleConfig,
  type RiskLevel,
} from './types'

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function riskLevelToFactor(riskLevel: RiskLevel | undefined): number {
  switch (riskLevel) {
    case 'HIGH':
      return 1
    case 'LOW':
      return 0
    case 'MEDIUM':
    default:
      return 0.5
  }
}

/**
 * The lowest price at which `marginPercent` is still met once the
 * price-dependent payment processing fee is accounted for. Solved
 * algebraically (not searched) so it is exact.
 */
export function solvePriceForMargin(
  fixedVariableCostCents: number,
  marginPercent: number,
  rule: PricingRuleConfig,
): number {
  const denominator = 1 - marginPercent - rule.paymentProcessingPercent
  if (denominator <= 0) {
    throw new Error(
      `Pricing rule is infeasible: minimum/target margin (${marginPercent}) plus payment processing percent (${rule.paymentProcessingPercent}) must be less than 1.`,
    )
  }
  const raw = (fixedVariableCostCents + rule.paymentProcessingFixedCents) / denominator
  return Math.ceil(raw)
}

function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  if (sorted.length % 2 === 0) {
    return Math.round((sorted[mid - 1] + sorted[mid]) / 2)
  }
  return sorted[mid]
}

function computeCompetitivePriceCents(observations: MarketPriceObservation[] | undefined): number | null {
  if (!observations || observations.length === 0) return null
  return median(observations.map((o) => o.priceCents))
}

interface AcceptanceEstimate {
  probability: number
  confidence: number
  estimationMethod: 'historical' | 'heuristic_no_history'
}

function estimateAcceptance(
  priceCents: number,
  floorCents: number,
  premiumCents: number,
  historical: HistoricalAcceptance | undefined,
): AcceptanceEstimate {
  const MIN_SAMPLE_FOR_HISTORY = 5
  if (historical && historical.quoted >= MIN_SAMPLE_FOR_HISTORY) {
    const probability = clamp(historical.accepted / historical.quoted, 0.01, 0.99)
    // Confidence grows with sample size but is capped — the engine never
    // claims statistical significance it doesn't have.
    const confidence = clamp(0.3 + historical.quoted / 50, 0.3, 0.9)
    return { probability, confidence, estimationMethod: 'historical' }
  }

  // No (or too little) historical data: a labeled heuristic, not a
  // statistical estimate. Acceptance probability decreases smoothly as
  // price moves from the floor toward the premium price.
  const range = Math.max(1, premiumCents - floorCents)
  const t = clamp((priceCents - floorCents) / range, 0, 1.5)
  const probability = clamp(0.85 - 0.5 * t, 0.1, 0.9)
  return { probability, confidence: 0.3, estimationMethod: 'heuristic_no_history' }
}

function determinePriceAction(params: {
  marginAtRecommended: number
  rule: PricingRuleConfig
  riskLevel: RiskLevel
  technicianCapacityPercent: number | undefined
  historicalAcceptance: HistoricalAcceptance | undefined
}): PriceAction {
  const { marginAtRecommended, rule, riskLevel, technicianCapacityPercent, historicalAcceptance } = params

  if (marginAtRecommended < rule.minimumMarginPercent - 1e-9) {
    return 'MANUAL_REVIEW'
  }
  if (riskLevel === 'HIGH') {
    return 'REQUIRE_DIAGNOSTIC_FEE'
  }

  const capacityFraction = technicianCapacityPercent !== undefined ? technicianCapacityPercent / 100 : undefined
  const acceptanceRate =
    historicalAcceptance && historicalAcceptance.quoted >= 5
      ? historicalAcceptance.accepted / historicalAcceptance.quoted
      : undefined

  if (capacityFraction !== undefined && capacityFraction > rule.capacityHighThresholdPercent && acceptanceRate !== undefined && acceptanceRate > 0.7) {
    return 'INCREASE'
  }
  if (acceptanceRate !== undefined && acceptanceRate < 0.3) {
    return 'DECREASE'
  }
  return 'MAINTAIN'
}

export function recommendPrice(request: PricingRequest): PriceRecommendation {
  const rule = request.rule ?? DEFAULT_PRICING_RULE
  const riskLevel = request.riskLevel ?? 'MEDIUM'
  const complexityScore = clamp(request.complexityScore ?? 0, 0, 1)
  const riskFactor = riskLevelToFactor(riskLevel)

  const fixedVariableCostCents = computeFixedVariableCostCents(request.costInputs, rule)

  const floorPriceCents = solvePriceForMargin(fixedVariableCostCents, rule.minimumMarginPercent, rule)
  const targetPriceCents = solvePriceForMargin(fixedVariableCostCents, rule.targetMarginPercent, rule)

  let adjustmentMultiplier = 1
  if (request.isRush) adjustmentMultiplier *= rule.rushMultiplier
  adjustmentMultiplier *= 1 + (rule.complexityMultiplierMax - 1) * complexityScore
  adjustmentMultiplier *= 1 + (rule.riskMultiplierMax - 1) * riskFactor

  const baseRecommendedCents = Math.max(
    floorPriceCents,
    Math.round(targetPriceCents * adjustmentMultiplier),
  )

  const maxJustifiedPriceCents = Math.round(floorPriceCents * rule.maximumJustifiedMultiplier)
  const premiumPriceCents = Math.min(
    Math.round(baseRecommendedCents * rule.premiumFactor),
    maxJustifiedPriceCents,
  )

  const riskFlags: string[] = []
  const reasoning: string[] = []

  reasoning.push(
    `Price floor set at $${(floorPriceCents / 100).toFixed(2)} to guarantee the configured ${(rule.minimumMarginPercent * 100).toFixed(0)}% minimum margin after payment processing fees.`,
  )
  reasoning.push(
    `Target price of $${(targetPriceCents / 100).toFixed(2)} reflects the ${(rule.targetMarginPercent * 100).toFixed(0)}% target margin before adjustments.`,
  )
  if (request.isRush) reasoning.push(`Rush service applied a ${rule.rushMultiplier}x multiplier.`)
  if (complexityScore > 0) {
    reasoning.push(`Complexity score ${complexityScore.toFixed(2)} applied up to a ${rule.complexityMultiplierMax}x multiplier.`)
  }
  if (riskLevel !== 'LOW') {
    reasoning.push(`Risk level ${riskLevel} applied up to a ${rule.riskMultiplierMax}x multiplier.`)
  }

  // Capacity-aware adjustment. Legitimate business factor, not a
  // customer-specific/discriminatory adjustment (source spec §18).
  let recommendedPriceCents = baseRecommendedCents
  if (request.technicianCapacityPercent !== undefined) {
    const capacityFraction = request.technicianCapacityPercent / 100
    if (capacityFraction > rule.capacityHighThresholdPercent) {
      riskFlags.push('CAPACITY_CONSTRAINED')
      if (request.isLowPriority) {
        recommendedPriceCents = Math.round(
          baseRecommendedCents + (premiumPriceCents - baseRecommendedCents) * 0.5,
        )
        reasoning.push(
          `Technician capacity at ${request.technicianCapacityPercent.toFixed(0)}% (above the ${(rule.capacityHighThresholdPercent * 100).toFixed(0)}% threshold): low-priority work priced up toward the premium range to protect scarce bench time.`,
        )
      }
    } else if (capacityFraction < rule.capacityLowThresholdPercent) {
      riskFlags.push('UNDERUTILIZED_CAPACITY')
      recommendedPriceCents = Math.round(
        Math.max(floorPriceCents, baseRecommendedCents - (baseRecommendedCents - floorPriceCents) * 0.3),
      )
      reasoning.push(
        `Technician capacity at ${request.technicianCapacityPercent.toFixed(0)}% (below the ${(rule.capacityLowThresholdPercent * 100).toFixed(0)}% threshold): recommended price allowed to drift toward the floor within configured limits to fill idle capacity.`,
      )
    }
  }
  recommendedPriceCents = clamp(recommendedPriceCents, floorPriceCents, maxJustifiedPriceCents)

  const competitivePriceCents = computeCompetitivePriceCents(request.marketObservations)
  if (competitivePriceCents === null) {
    riskFlags.push('NO_MARKET_DATA')
    reasoning.push('No market pricing observations supplied — competitive price is omitted rather than estimated.')
  } else {
    reasoning.push(`Competitive price of $${(competitivePriceCents / 100).toFixed(2)} computed as the median of ${request.marketObservations!.length} supplied market observation(s).`)
  }

  const breakdown = computeCostBreakdown(request.costInputs, rule, recommendedPriceCents)
  const grossProfitCents = computeGrossProfitCents(recommendedPriceCents, breakdown)
  const grossMarginPercent = computeGrossMarginPercent(recommendedPriceCents, breakdown)
  const profitPerTechnicianHourCents = computeProfitPerTechnicianHourCents(
    grossProfitCents,
    request.costInputs.laborHours,
  )

  const acceptance = estimateAcceptance(recommendedPriceCents, floorPriceCents, premiumPriceCents, request.historicalAcceptance)
  if (acceptance.estimationMethod === 'heuristic_no_history') {
    riskFlags.push('INSUFFICIENT_HISTORY')
    reasoning.push('Insufficient historical quote data for this category — acceptance probability is a labeled heuristic estimate, not a statistical prediction.')
  } else {
    reasoning.push(`Acceptance probability of ${(acceptance.probability * 100).toFixed(0)}% derived from ${request.historicalAcceptance!.quoted} historical quotes at a comparable price.`)
  }

  const expectedContributionProfitCents = Math.round(grossProfitCents * acceptance.probability)

  if (riskLevel === 'HIGH') riskFlags.push('HIGH_RISK')

  let confidence = acceptance.confidence
  if (competitivePriceCents === null) confidence = Math.min(confidence, 0.5)
  if (riskLevel === 'HIGH') confidence = Math.min(confidence, 0.4)
  confidence = clamp(confidence, 0, 1)
  if (confidence < rule.approvalConfidenceThreshold) riskFlags.push('LOW_CONFIDENCE')

  const priceAction = determinePriceAction({
    marginAtRecommended: grossMarginPercent,
    rule,
    riskLevel,
    technicianCapacityPercent: request.technicianCapacityPercent,
    historicalAcceptance: request.historicalAcceptance,
  })

  if (recommendedPriceCents < floorPriceCents) riskFlags.push('BELOW_FLOOR')

  const requiresHumanApproval =
    recommendedPriceCents < floorPriceCents ||
    grossMarginPercent < rule.minimumMarginPercent - 1e-9 ||
    riskFlags.includes('HIGH_RISK') ||
    confidence < rule.approvalConfidenceThreshold ||
    rule.manualReviewOverride ||
    priceAction === 'MANUAL_REVIEW' ||
    priceAction === 'REQUIRE_DIAGNOSTIC_FEE'

  if (requiresHumanApproval) {
    reasoning.push('This recommendation requires human review before it is sent to a customer.')
  }

  return {
    repairCategory: request.repairCategory,
    recommendedPriceCents,
    priceFloorCents: floorPriceCents,
    competitivePriceCents,
    premiumPriceCents,
    maxJustifiedPriceCents,
    partsCostCents: breakdown.partsCostCents,
    laborCostCents: breakdown.laborCostCents,
    estimatedTotalCostCents: breakdown.trueCostCents,
    grossProfitCents,
    grossMarginPercent,
    profitPerTechnicianHourCents,
    estimatedAcceptanceProbability: acceptance.probability,
    expectedContributionProfitCents,
    confidence,
    priceAction,
    reasoning,
    riskFlags,
    requiresHumanApproval,
  }
}
