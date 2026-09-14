// No-op AI provider — used when no AI provider is configured. Every agent
// that calls an AI provider must catch this and fall back to a
// deterministic, code-generated explanation; the pricing engine itself
// never depends on an AI response to produce a number.

import type { AICompletionRequest, AICompletionResult, AIProvider } from './provider'

export class NoneProvider implements AIProvider {
  readonly name = 'none'

  async complete(_request: AICompletionRequest): Promise<AICompletionResult> {
    throw new Error(
      'No AI provider is configured (set AI_PROVIDER and the matching API key, e.g. ANTHROPIC_API_KEY, to enable AI-generated narrative/classification). The deterministic pricing engine works without one.',
    )
  }
}
