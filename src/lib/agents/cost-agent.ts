// Agent 3 — Cost Accounting Agent. Thin wrapper around the deterministic
// cost engine. Never calls an LLM: cost accounting is pure arithmetic over
// admin-configured rates. See /docs/AGENT_SPECIFICATIONS.md.

import { computeCostBreakdown, computeFixedVariableCostCents } from '@/lib/pricing/cost-engine'
import { solvePriceForMargin } from '@/lib/pricing/pricing-engine'
import { DEFAULT_PRICING_RULE, type CostBreakdown, type PricingRequest } from '@/lib/pricing/types'
import { logAgentRun } from './log-agent-run'

export interface CostAgentResult {
  breakdown: CostBreakdown
  agentRunId: string
}

/**
 * Reports the cost breakdown at the rule's target-margin price point — a
 * representative, price-independent view of "what this repair truly costs"
 * for observability/reporting, independent of whatever the pricing agent
 * ultimately recommends.
 */
export async function runCostAgent(request: PricingRequest): Promise<CostAgentResult> {
  const startedAt = Date.now()
  const rule = request.rule ?? DEFAULT_PRICING_RULE

  const fixedVariableCostCents = computeFixedVariableCostCents(request.costInputs, rule)
  const referencePriceCents = solvePriceForMargin(fixedVariableCostCents, rule.targetMarginPercent, rule)
  const breakdown = computeCostBreakdown(request.costInputs, rule, referencePriceCents)

  const latencyMs = Date.now() - startedAt
  const run = await logAgentRun({
    agentName: 'COST_AGENT',
    taskDescription: `Compute true-cost breakdown for ${request.repairCategory}`,
    provider: 'none',
    inputSummary: { repairCategory: request.repairCategory, costInputs: request.costInputs },
    outputSummary: breakdown,
    latencyMs,
    succeeded: true,
  })

  return { breakdown, agentRunId: run.id }
}
