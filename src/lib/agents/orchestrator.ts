// Agent 1 — Revenue Orchestrator (pricing flow). Routes a pricing question
// to the Cost Agent and Pricing Agent, merges their output, persists the
// recommendation, and links every agent run to it for observability.
// See /docs/AGENT_SPECIFICATIONS.md and /docs/REVENUE_AI_ARCHITECTURE.md.

import { prisma } from '@/lib/prisma'
import { computeCostBreakdown } from '@/lib/pricing/cost-engine'
import { DEFAULT_PRICING_RULE, type PriceRecommendation, type PricingRequest } from '@/lib/pricing/types'
import { runCostAgent } from './cost-agent'
import { runPricingAgent } from './pricing-agent'
import { logAgentRun } from './log-agent-run'

export interface RunPricingOrchestratorInput {
  pricingRequest: PricingRequest
  repairCategoryId?: string
  repairId?: string
  symptomText?: string
}

export interface RunPricingOrchestratorResult {
  recommendationId: string
  recommendation: PriceRecommendation
  aiNarrative: string | null
  aiRiskFlags: string[]
  agentRunIds: string[]
}

export async function runPricingOrchestrator(
  input: RunPricingOrchestratorInput,
): Promise<RunPricingOrchestratorResult> {
  const startedAt = Date.now()
  const rule = input.pricingRequest.rule ?? DEFAULT_PRICING_RULE

  const [costResult, pricingResult] = await Promise.all([
    runCostAgent(input.pricingRequest),
    runPricingAgent(input.pricingRequest, input.symptomText),
  ])

  const rec = pricingResult.recommendation
  // Recompute the full itemized breakdown at the recommended price for
  // persistence — the PriceRecommendation output type intentionally mirrors
  // the source spec's §6 JSON schema and doesn't carry every line item.
  const breakdown = computeCostBreakdown(input.pricingRequest.costInputs, rule, rec.recommendedPriceCents)

  const combinedRiskFlags = Array.from(new Set([...rec.riskFlags, ...pricingResult.aiRiskFlags]))
  const reasoning = pricingResult.aiNarrative
    ? [...rec.reasoning, `AI summary: ${pricingResult.aiNarrative}`]
    : rec.reasoning

  const created = await prisma.pricingRecommendation.create({
    data: {
      repairCategoryId: input.repairCategoryId ?? null,
      repairId: input.repairId ?? null,
      partsCostCents: breakdown.partsCostCents,
      laborHours: input.pricingRequest.costInputs.laborHours,
      technicianHourlyCostCents:
        input.pricingRequest.costInputs.technicianHourlyCostCents ?? rule.technicianHourlyCostCents,
      shippingCostCents: breakdown.shippingCostCents,
      paymentCostCents: breakdown.paymentCostCents,
      consumablesCostCents: breakdown.consumablesCostCents,
      warrantyReserveCents: breakdown.warrantyReserveCents,
      overheadCents: breakdown.overheadCents,
      estimatedTotalCostCents: breakdown.trueCostCents,
      priceFloorCents: rec.priceFloorCents,
      competitivePriceCents: rec.competitivePriceCents,
      recommendedPriceCents: rec.recommendedPriceCents,
      premiumPriceCents: rec.premiumPriceCents,
      maxJustifiedPriceCents: rec.maxJustifiedPriceCents,
      grossProfitCents: rec.grossProfitCents,
      grossMarginPercent: rec.grossMarginPercent,
      profitPerTechnicianHourCents: rec.profitPerTechnicianHourCents,
      estimatedAcceptanceProbability: rec.estimatedAcceptanceProbability,
      expectedContributionProfitCents: rec.expectedContributionProfitCents,
      confidence: rec.confidence,
      priceAction: rec.priceAction,
      reasoning,
      riskFlags: combinedRiskFlags,
      requiresHumanApproval: rec.requiresHumanApproval,
      status: rec.requiresHumanApproval ? 'PENDING_REVIEW' : 'AUTO_APPROVED',
    },
  })

  await prisma.agentRun.updateMany({
    where: { id: { in: [costResult.agentRunId, pricingResult.agentRunId] } },
    data: { pricingRecommendationId: created.id },
  })

  const orchestratorRun = await logAgentRun({
    agentName: 'ORCHESTRATOR',
    taskDescription: `Orchestrate pricing recommendation for ${input.pricingRequest.repairCategory}`,
    provider: 'none',
    inputSummary: { repairCategory: input.pricingRequest.repairCategory, repairCategoryId: input.repairCategoryId, repairId: input.repairId },
    outputSummary: {
      recommendationId: created.id,
      recommendedPriceCents: rec.recommendedPriceCents,
      priceAction: rec.priceAction,
      requiresHumanApproval: rec.requiresHumanApproval,
    },
    latencyMs: Date.now() - startedAt,
    succeeded: true,
    pricingRecommendationId: created.id,
  })

  return {
    recommendationId: created.id,
    recommendation: rec,
    aiNarrative: pricingResult.aiNarrative,
    aiRiskFlags: pricingResult.aiRiskFlags,
    agentRunIds: [costResult.agentRunId, pricingResult.agentRunId, orchestratorRun.id],
  }
}
