// Marketing self-healing — deterministic decision logic. See
// /docs/MARKETING_AI_ARCHITECTURE.md. No LLM call in this file: an
// evaluate* function's output is a fact you can recompute by hand from its
// inputs, the same rule the pricing engine follows for money.

export interface CampaignHealthInput {
  channel: string
  spendCents: number
  leads: number
  targetCplCents: number
  /** How many consecutive check periods this campaign has missed target by the bad-CPL threshold. */
  consecutiveBadPeriods: number
}

export interface CampaignHealthResult {
  action: 'WATCH' | 'FLAG_FOR_REVIEW' | 'AUTO_PAUSE' | 'AUTO_REALLOCATE'
  actualCplCents: number | null
  reason: string
}

const BAD_CPL_MULTIPLIER = 1.5
const BAD_PERIODS_BEFORE_PAUSE = 3

/**
 * Evaluate a single channel/campaign's spend-to-lead efficiency against its
 * target cost-per-lead. Pure function — ready to run the moment real ad
 * spend/lead data exists; see MARKETING_ORCHESTRATOR for how its result
 * becomes a MarketingDraft rather than an executed action.
 */
export function evaluateCampaignHealth(input: CampaignHealthInput): CampaignHealthResult {
  if (input.leads <= 0) {
    if (input.spendCents <= 0) {
      return { action: 'WATCH', actualCplCents: null, reason: 'No spend or leads recorded yet.' }
    }
    return {
      action: input.consecutiveBadPeriods >= BAD_PERIODS_BEFORE_PAUSE ? 'AUTO_PAUSE' : 'FLAG_FOR_REVIEW',
      actualCplCents: null,
      reason: `${input.channel} has spent ${(input.spendCents / 100).toFixed(2)} with zero leads recorded.`,
    }
  }

  const actualCplCents = Math.round(input.spendCents / input.leads)
  const badThresholdCents = Math.round(input.targetCplCents * BAD_CPL_MULTIPLIER)

  if (actualCplCents <= input.targetCplCents) {
    return {
      action: 'WATCH',
      actualCplCents,
      reason: `${input.channel} CPL $${(actualCplCents / 100).toFixed(2)} is at or under target $${(input.targetCplCents / 100).toFixed(2)}.`,
    }
  }

  if (actualCplCents <= badThresholdCents) {
    return {
      action: 'FLAG_FOR_REVIEW',
      actualCplCents,
      reason: `${input.channel} CPL $${(actualCplCents / 100).toFixed(2)} is over target ($${(input.targetCplCents / 100).toFixed(2)}) but within the 1.5x tolerance band.`,
    }
  }

  if (input.consecutiveBadPeriods >= BAD_PERIODS_BEFORE_PAUSE) {
    return {
      action: 'AUTO_PAUSE',
      actualCplCents,
      reason: `${input.channel} CPL $${(actualCplCents / 100).toFixed(2)} has exceeded 1.5x target for ${input.consecutiveBadPeriods} consecutive periods.`,
    }
  }

  return {
    action: 'AUTO_REALLOCATE',
    actualCplCents,
    reason: `${input.channel} CPL $${(actualCplCents / 100).toFixed(2)} is over 1.5x target ($${(input.targetCplCents / 100).toFixed(2)}); recommend shifting budget toward a better-performing channel before it repeats.`,
  }
}

export interface FunnelCheckInput {
  target: string
  httpStatus: number | null
  latencyMs: number | null
  expectedContentFound: boolean | null
  errorDetail: string | null
}

export interface FunnelCheckResult {
  status: 'OK' | 'DEGRADED' | 'DOWN'
  reason: string
}

const SLOW_LATENCY_MS = 5000

/** Self-healing (technical): classify one funnel-health-check result. */
export function evaluateFunnelHealth(input: FunnelCheckInput): FunnelCheckResult {
  if (input.errorDetail) {
    return { status: 'DOWN', reason: input.errorDetail }
  }
  if (input.httpStatus == null || input.httpStatus >= 500) {
    return { status: 'DOWN', reason: `${input.target} returned HTTP ${input.httpStatus ?? 'no response'}.` }
  }
  if (input.httpStatus >= 400) {
    return { status: 'DEGRADED', reason: `${input.target} returned HTTP ${input.httpStatus}.` }
  }
  if (input.expectedContentFound === false) {
    return { status: 'DEGRADED', reason: `${input.target} responded but expected content was not found.` }
  }
  if (input.latencyMs != null && input.latencyMs > SLOW_LATENCY_MS) {
    return {
      status: 'DEGRADED',
      reason: `${input.target} responded in ${input.latencyMs}ms, over the ${SLOW_LATENCY_MS}ms threshold.`,
    }
  }
  return { status: 'OK', reason: `${input.target} is healthy.` }
}
