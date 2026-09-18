// Agent — Marketing Creative (self-learning). Reads this channel's
// MarketingLesson history before drafting new ad copy, so each cycle is
// informed by what already worked — the actual self-learning loop, not
// just a label. Like pricing-agent.ts, an AI provider (when configured)
// only drafts language; nothing here spends money or publishes anything —
// every result is a MarketingDraft awaiting human approval. See
// /docs/MARKETING_AI_ARCHITECTURE.md.

import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import type { MarketingChannel, Prisma } from '@prisma/client'
import { getAIProvider } from '@/lib/ai/provider'
import { getLessonsForChannel } from '@/lib/marketing/lessons'
import { logAgentRun } from '@/lib/agents/log-agent-run'
import { siteConfig } from '@/lib/site-config'

const aiOutputSchema = z.object({
  headlines: z.array(z.string().min(1).max(90)).min(3).max(10),
  primaryText: z.string().min(1).max(600),
})

const SYSTEM_PROMPT = `You write ad copy for ${siteConfig.name}, a board-level electronics repair
laboratory. You are given the target channel, a brief, and a list of past lessons about what has
and hasn't worked (each labeled with a confidence tier). Weight known_fact and historical_evidence
lessons heavily; treat hypothesis lessons as a direction to try, not a certainty; ignore
insufficient_data lessons except as a reminder that claim isn't proven yet. Never invent a
guarantee, price, or capability not present in the brief. Respond with ONLY a JSON object:
{"headlines": string[], "primaryText": string}. No markdown fences, no extra commentary.`

function buildPrompt(channel: string, brief: string, lessons: { tag: string; summary: string; confidence: string }[]): string {
  const lessonBlock =
    lessons.length > 0
      ? lessons.map((l) => `- [${l.confidence}] ${l.tag}: ${l.summary}`).join('\n')
      : '(no recorded lessons for this channel yet)'
  return [`Channel: ${channel}`, `Brief: ${brief}`, `Past lessons:\n${lessonBlock}`].join('\n\n')
}

function extractJsonObject(text: string): unknown {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) {
    throw new Error('AI response did not contain a JSON object')
  }
  return JSON.parse(text.slice(start, end + 1))
}

function fallbackCopy(brief: string) {
  return {
    headlines: [brief.slice(0, 90)],
    primaryText: brief,
  }
}

export interface DraftAdCopyInput {
  channel: MarketingChannel
  brief: string
}

export interface DraftAdCopyResult {
  draftId: string
  headlines: string[]
  primaryText: string
}

export async function draftAdCopy(input: DraftAdCopyInput): Promise<DraftAdCopyResult> {
  const startedAt = Date.now()
  const lessons = await getLessonsForChannel(input.channel)

  let headlines: string[]
  let primaryText: string
  let provider = 'none'
  let model: string | null = null
  let tokenEstimate: number | null = null
  let costEstimateCents: number | null = null
  let succeeded = true
  let errorMessage: string | null = null

  try {
    const aiProvider = getAIProvider()
    const result = await aiProvider.complete({
      tier: 'fast',
      system: SYSTEM_PROMPT,
      prompt: buildPrompt(input.channel, input.brief, lessons),
      maxTokens: 800,
    })
    const parsed = aiOutputSchema.parse(extractJsonObject(result.text))
    headlines = parsed.headlines
    primaryText = parsed.primaryText
    provider = result.provider
    model = result.model
    tokenEstimate = result.tokenEstimate
    costEstimateCents = result.costEstimateCents
  } catch (err) {
    // Fail closed: no configured provider, a network error, or malformed
    // output all fall back to the brief verbatim rather than blocking —
    // a human reviewing the draft can always improve wording by hand.
    succeeded = false
    errorMessage = err instanceof Error ? err.message : String(err)
    const fallback = fallbackCopy(input.brief)
    headlines = fallback.headlines
    primaryText = fallback.primaryText
  }

  const draft = await prisma.marketingDraft.create({
    data: {
      type: 'AD_CREATIVE',
      channel: input.channel,
      title: headlines[0] ?? input.brief.slice(0, 90),
      payload: { headlines, primaryText, brief: input.brief } as Prisma.InputJsonValue,
      rationale:
        lessons.length > 0
          ? `Informed by ${lessons.length} past lesson(s) for ${input.channel}.`
          : 'No past lessons for this channel yet — first cycle.',
      createdByAgent: 'MARKETING_CREATIVE',
    },
  })

  await logAgentRun({
    agentName: 'MARKETING_CREATIVE',
    taskDescription: `Draft ad copy for ${input.channel}`,
    provider,
    model,
    inputSummary: { channel: input.channel, brief: input.brief, lessonCount: lessons.length },
    outputSummary: { draftId: draft.id, headlines, primaryText },
    latencyMs: Date.now() - startedAt,
    tokenEstimate,
    costEstimateCents,
    succeeded,
    errorMessage,
  })

  return { draftId: draft.id, headlines, primaryText }
}
