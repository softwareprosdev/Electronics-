// Deterministic pricing/cost engine types.
// See /docs/PRICING_ENGINE.md for the full design rationale.
// This module has zero I/O and zero LLM dependency by design — every
// export here is a pure data shape or pure function input/output.

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH'

export type PriceAction =
  | 'INCREASE'
  | 'DECREASE'
  | 'MAINTAIN'
  | 'REQUIRE_DIAGNOSTIC_FEE'
  | 'MANUAL_REVIEW'

/**
 * Admin-configurable inputs to the pricing engine (backed by the
 * `PricingRule` Prisma model — see /admin/pricing/rules). Nothing in
 * cost-engine.ts / pricing-engine.ts hard-codes a business constant;
 * every knob lives here.
 */
export interface PricingRuleConfig {
  minimumMarginPercent: number
  targetMarginPercent: number
  minimumDiagnosticFeeCents: number
  minimumRepairPriceCents: number
  maximumDiscountPercent: number
  rushMultiplier: number
  complexityMultiplierMax: number
  riskMultiplierMax: number
  premiumFactor: number
  maximumJustifiedMultiplier: number
  warrantyReservePercent: number
  overheadAllocationPercent: number
  paymentProcessingPercent: number
  paymentProcessingFixedCents: number
  technicianHourlyCostCents: number
  capacityHighThresholdPercent: number
  capacityLowThresholdPercent: number
  approvalConfidenceThreshold: number
  manualReviewOverride: boolean
}

/** Matches the defaults on the `PricingRule` Prisma model. */
export const DEFAULT_PRICING_RULE: PricingRuleConfig = {
  minimumMarginPercent: 0.35,
  targetMarginPercent: 0.55,
  minimumDiagnosticFeeCents: 4900,
  minimumRepairPriceCents: 4900,
  maximumDiscountPercent: 0.15,
  rushMultiplier: 1.25,
  complexityMultiplierMax: 1.3,
  riskMultiplierMax: 1.2,
  premiumFactor: 1.15,
  maximumJustifiedMultiplier: 1.6,
  warrantyReservePercent: 0.04,
  overheadAllocationPercent: 0.08,
  paymentProcessingPercent: 0.029,
  paymentProcessingFixedCents: 30,
  technicianHourlyCostCents: 4500,
  capacityHighThresholdPercent: 0.9,
  capacityLowThresholdPercent: 0.5,
  approvalConfidenceThreshold: 0.55,
  manualReviewOverride: false,
}

export interface CostInputs {
  partsCostCents: number
  laborHours: number
  diagnosticHours?: number
  shippingCostCents?: number
  consumablesCostCents?: number
  /** Overrides `rule.technicianHourlyCostCents` when a specific technician's rate is known. */
  technicianHourlyCostCents?: number
}

/** The true-cost breakdown for one specific candidate sale price. */
export interface CostBreakdown {
  partsCostCents: number
  laborCostCents: number
  diagnosticCostCents: number
  shippingCostCents: number
  consumablesCostCents: number
  warrantyReserveCents: number
  overheadCents: number
  paymentCostCents: number
  /** parts + labor + diagnostic + shipping + consumables + warranty reserve + payment (at this price) */
  variableCostCents: number
  /** variableCostCents + overheadCents */
  trueCostCents: number
}

export interface MarketPriceObservation {
  priceCents: number
  source: string
  observedAt: string
  confidence?: number
}

export interface HistoricalAcceptance {
  /** Number of quotes accepted at a comparable price point. */
  accepted: number
  /** Total quotes sent at a comparable price point. */
  quoted: number
}

export interface PricingRequest {
  repairCategory: string
  costInputs: CostInputs
  rule?: PricingRuleConfig
  riskLevel?: RiskLevel
  /** 0-1. How far outside routine work this repair is. */
  complexityScore?: number
  isRush?: boolean
  /** Low-priority work is the first thing capacity-constrained pricing pushes toward premium. */
  isLowPriority?: boolean
  /** 0-100. Current technician bench utilization, if known. */
  technicianCapacityPercent?: number
  marketObservations?: MarketPriceObservation[]
  historicalAcceptance?: HistoricalAcceptance
}

export interface PriceRecommendation {
  repairCategory: string
  recommendedPriceCents: number
  priceFloorCents: number
  competitivePriceCents: number | null
  premiumPriceCents: number
  maxJustifiedPriceCents: number
  partsCostCents: number
  laborCostCents: number
  estimatedTotalCostCents: number
  grossProfitCents: number
  grossMarginPercent: number
  profitPerTechnicianHourCents: number | null
  estimatedAcceptanceProbability: number
  expectedContributionProfitCents: number
  confidence: number
  priceAction: PriceAction
  reasoning: string[]
  riskFlags: string[]
  requiresHumanApproval: boolean
}
