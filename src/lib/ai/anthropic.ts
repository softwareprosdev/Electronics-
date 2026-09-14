// Anthropic Messages API provider. Implemented via `fetch` directly rather
// than the SDK to keep the dependency footprint small — see
// /docs/REVENUE_AI_ARCHITECTURE.md for why the AI layer is provider-agnostic.

import type { AICompletionRequest, AICompletionResult, AIProvider, AIModelTier } from './provider'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_VERSION = '2023-06-01'

const DEFAULT_MODELS: Record<AIModelTier, string> = {
  fast: 'claude-haiku-4-5-20251001',
  advanced: 'claude-sonnet-5',
}

// Approximate cost per 1,000 tokens, in cents. These are rough defaults for
// AI-spend estimation/observability (AgentRun.costEstimateCents), not a
// billing-accurate figure — override via env for your actual plan pricing.
const DEFAULT_COST_PER_1K_INPUT_CENTS: Record<AIModelTier, number> = {
  fast: 0.08,
  advanced: 0.3,
}
const DEFAULT_COST_PER_1K_OUTPUT_CENTS: Record<AIModelTier, number> = {
  fast: 0.4,
  advanced: 1.5,
}

function modelForTier(tier: AIModelTier): string {
  if (tier === 'fast') return process.env.AI_MODEL_FAST || DEFAULT_MODELS.fast
  return process.env.AI_MODEL_ADVANCED || DEFAULT_MODELS.advanced
}

function envFloat(name: string, fallback: number): number {
  const raw = process.env[name]
  if (!raw) return fallback
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

interface AnthropicMessageResponse {
  content: Array<{ type: string; text?: string }>
  usage?: { input_tokens: number; output_tokens: number }
}

export class AnthropicProvider implements AIProvider {
  readonly name = 'anthropic'

  async complete(request: AICompletionRequest): Promise<AICompletionResult> {
    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not set.')
    }

    const model = modelForTier(request.tier)
    const startedAt = Date.now()

    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model,
        max_tokens: request.maxTokens ?? 1024,
        system: request.system,
        messages: [{ role: 'user', content: request.prompt }],
      }),
    })

    const latencyMs = Date.now() - startedAt

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      throw new Error(`Anthropic API error ${response.status}: ${body.slice(0, 500)}`)
    }

    const data = (await response.json()) as AnthropicMessageResponse
    const text = data.content.find((block) => block.type === 'text')?.text ?? ''
    const inputTokens = data.usage?.input_tokens ?? 0
    const outputTokens = data.usage?.output_tokens ?? 0
    const tokenEstimate = inputTokens + outputTokens

    const costPerKIn = envFloat('AI_COST_PER_1K_INPUT_CENTS_' + request.tier.toUpperCase(), DEFAULT_COST_PER_1K_INPUT_CENTS[request.tier])
    const costPerKOut = envFloat('AI_COST_PER_1K_OUTPUT_CENTS_' + request.tier.toUpperCase(), DEFAULT_COST_PER_1K_OUTPUT_CENTS[request.tier])
    const costEstimateCents = (inputTokens / 1000) * costPerKIn + (outputTokens / 1000) * costPerKOut

    return {
      text,
      provider: this.name,
      model,
      latencyMs,
      tokenEstimate,
      costEstimateCents,
    }
  }
}
