// AI provider abstraction. See /docs/REVENUE_AI_ARCHITECTURE.md.
//
// Nothing outside this folder should import a vendor SDK or call a vendor
// API directly — every AI call in the codebase goes through getAIProvider().

import { AnthropicProvider } from './anthropic'
import { NoneProvider } from './none'

export type AIModelTier = 'fast' | 'advanced'

export interface AICompletionRequest {
  /** System prompt — sets the model's role and hard constraints. */
  system: string
  /** The user-turn content, including any data the model should reason over. */
  prompt: string
  /**
   * "fast" for classification/narrative tasks, "advanced" for
   * orchestration-level reasoning. Implements the model-routing cost
   * control described in the source spec (§23): cheap model for simple
   * tasks, advanced model only when justified.
   */
  tier: AIModelTier
  maxTokens?: number
}

export interface AICompletionResult {
  text: string
  provider: string
  model: string
  latencyMs: number
  tokenEstimate: number
  costEstimateCents: number
}

export interface AIProvider {
  readonly name: string
  complete(request: AICompletionRequest): Promise<AICompletionResult>
}

function resolveProviderName(): string {
  const configured = process.env.AI_PROVIDER?.toLowerCase().trim()
  if (configured) return configured
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic'
  return 'none'
}

/**
 * Resolves the configured AI provider from environment variables. A fresh
 * instance is constructed per call (construction is cheap — no network I/O
 * happens until `.complete()` is invoked) so this always reflects the
 * current environment, which matters for tests.
 */
export function getAIProvider(): AIProvider {
  const key = resolveProviderName()
  if (key === 'anthropic') {
    return new AnthropicProvider()
  }
  return new NoneProvider()
}
