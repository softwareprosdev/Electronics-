import { prisma } from '@/lib/prisma'
import type { AgentName, Prisma } from '@prisma/client'

export interface AgentRunLog {
  agentName: AgentName
  taskDescription: string
  provider: string
  model?: string | null
  inputSummary: unknown
  outputSummary: unknown
  confidence?: number | null
  latencyMs: number
  tokenEstimate?: number | null
  costEstimateCents?: number | null
  succeeded: boolean
  errorMessage?: string | null
  pricingRecommendationId?: string | null
}

/**
 * Every agent/orchestrator invocation is logged here — the seed of the
 * Agent Operations observability described in /docs/AGENT_SPECIFICATIONS.md.
 * Logged whether or not the run used an LLM (a deterministic run is logged
 * with provider: "none").
 */
export async function logAgentRun(log: AgentRunLog) {
  return prisma.agentRun.create({
    data: {
      agentName: log.agentName,
      taskDescription: log.taskDescription,
      provider: log.provider,
      model: log.model ?? null,
      inputSummary: log.inputSummary as Prisma.InputJsonValue,
      outputSummary: log.outputSummary as Prisma.InputJsonValue,
      confidence: log.confidence ?? null,
      latencyMs: Math.round(log.latencyMs),
      tokenEstimate: log.tokenEstimate ?? null,
      costEstimateCents:
        log.costEstimateCents != null ? Math.round(log.costEstimateCents) : null,
      succeeded: log.succeeded,
      errorMessage: log.errorMessage ?? null,
      pricingRecommendationId: log.pricingRecommendationId ?? null,
    },
  })
}
