// Agent — Marketing Guardian (self-healing). Two responsibilities:
//
// 1. Technical: ingest funnel-health-check results (from
//    scripts/marketing-swarm/funnel-health-check.mjs), record them, and
//    immediately email a human the moment something is DOWN or DEGRADED —
//    this is a pure alert, spends no money and publishes nothing, so it
//    runs without the approval gate the rest of the swarm uses.
// 2. Campaign: evaluate spend/lead data against guardrails and draft the
//    recommended action for human approval (see evaluateCampaignHealth in
//    src/lib/marketing/guardrails.ts) — this DOES touch live ad spend, so
//    it always drafts rather than executes, per the swarm's approval
//    policy. No live ad-platform integration is connected yet (see
//    /docs/AGENT_SPECIFICATIONS.md, Agent 9), so this path has no
//    scheduled caller today — it is ready the moment one exists.

import { prisma } from '@/lib/prisma'
import type { MarketingChannel, Prisma } from '@prisma/client'
import { evaluateCampaignHealth, evaluateFunnelHealth, type FunnelCheckInput } from '@/lib/marketing/guardrails'
import { logAgentRun } from '@/lib/agents/log-agent-run'
import { sendEmail } from '@/lib/notify'
import { siteConfig } from '@/lib/site-config'

export interface FunnelCheckSubmission extends FunnelCheckInput {
  url: string
}

export interface FunnelIngestResult {
  target: string
  status: 'OK' | 'DEGRADED' | 'DOWN'
  reason: string
}

/** Records each check and alerts immediately on anything not OK. Never throws — a broken alert path must not crash the ingest endpoint. */
export async function runFunnelCheckIngest(
  submissions: FunnelCheckSubmission[],
): Promise<FunnelIngestResult[]> {
  const startedAt = Date.now()
  const results: FunnelIngestResult[] = []

  for (const submission of submissions) {
    const evaluation = evaluateFunnelHealth(submission)

    await prisma.funnelCheck.create({
      data: {
        target: submission.target,
        url: submission.url,
        status: evaluation.status,
        httpStatus: submission.httpStatus,
        latencyMs: submission.latencyMs,
        errorDetail: submission.errorDetail,
      },
    })

    results.push({ target: submission.target, status: evaluation.status, reason: evaluation.reason })

    if (evaluation.status !== 'OK') {
      await sendEmail({
        to: siteConfig.email,
        subject: `[Funnel Alert] ${submission.target} is ${evaluation.status}`,
        body: evaluation.reason,
      }).catch((err) => {
        console.error('Guardian agent: failed to send funnel alert email', err)
      })
    }
  }

  await logAgentRun({
    agentName: 'MARKETING_GUARDIAN',
    taskDescription: `Ingest ${submissions.length} funnel health check(s)`,
    provider: 'none',
    inputSummary: { targets: submissions.map((s) => s.target) },
    outputSummary: { results },
    latencyMs: Date.now() - startedAt,
    succeeded: true,
  })

  return results
}

export interface CampaignSignal {
  channel: MarketingChannel
  spendCents: number
  leads: number
  targetCplCents: number
  consecutiveBadPeriods: number
}

/**
 * Evaluates campaign spend/lead signals and drafts the recommended budget
 * action for human approval — never executes a pause/reallocation
 * directly. Ready to run the moment a live ad-platform integration feeds
 * it real signals; see the module comment above.
 */
export async function evaluateAndDraftCampaignActions(signals: CampaignSignal[]) {
  const startedAt = Date.now()
  const draftIds: string[] = []

  for (const signal of signals) {
    const evaluation = evaluateCampaignHealth(signal)
    if (evaluation.action === 'WATCH') continue

    const draft = await prisma.marketingDraft.create({
      data: {
        type: 'BUDGET_CHANGE',
        channel: signal.channel,
        title: `${evaluation.action.replace('_', ' ')}: ${signal.channel}`,
        payload: {
          action: evaluation.action,
          actualCplCents: evaluation.actualCplCents,
          targetCplCents: signal.targetCplCents,
          spendCents: signal.spendCents,
          leads: signal.leads,
        } as Prisma.InputJsonValue,
        rationale: evaluation.reason,
        guardrailAction: evaluation.action,
        createdByAgent: 'MARKETING_GUARDIAN',
      },
    })
    draftIds.push(draft.id)
  }

  await logAgentRun({
    agentName: 'MARKETING_GUARDIAN',
    taskDescription: `Evaluate ${signals.length} campaign signal(s) against guardrails`,
    provider: 'none',
    inputSummary: { channels: signals.map((s) => s.channel) },
    outputSummary: { draftIds },
    latencyMs: Date.now() - startedAt,
    succeeded: true,
  })

  return draftIds
}
