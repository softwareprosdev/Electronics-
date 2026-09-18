// Self-learning memory. A MarketingLesson is a claim about what works, tied
// to the evidence it came from and labeled with a confidence tier — the
// same "known_fact"/"historical_evidence"/"hypothesis"/"insufficient_data"
// convention pricing-agent.ts uses for AI-derived output. The creative
// agent reads these before drafting new copy; the orchestrator writes them
// after a cycle. See /docs/MARKETING_AI_ARCHITECTURE.md.

import { prisma } from '@/lib/prisma'
import type { MarketingChannel, Prisma } from '@prisma/client'

export type LessonConfidence = 'known_fact' | 'historical_evidence' | 'hypothesis' | 'insufficient_data'

export interface RecordLessonInput {
  channel: MarketingChannel
  tag: string
  summary: string
  evidence: unknown
  confidence: LessonConfidence
  sourceDraftId?: string | null
}

export async function recordLesson(input: RecordLessonInput) {
  return prisma.marketingLesson.create({
    data: {
      channel: input.channel,
      tag: input.tag,
      summary: input.summary,
      evidence: input.evidence as Prisma.InputJsonValue,
      confidence: input.confidence,
      sourceDraftId: input.sourceDraftId ?? null,
    },
  })
}

/** Most recent lessons for a channel, newest first — what the creative agent reads before drafting. */
export async function getLessonsForChannel(channel: MarketingChannel, limit = 10) {
  return prisma.marketingLesson.findMany({
    where: { channel },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
