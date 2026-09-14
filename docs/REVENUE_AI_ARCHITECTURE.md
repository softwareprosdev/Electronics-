# Revenue, Pricing & Profit Optimization Platform — Architecture

This document describes the architecture of the AI revenue/pricing/profit
optimization layer built on top of the existing Advanced Electronics Repair
Laboratory website and admin system. It reflects what is **actually
implemented** in this codebase today, and separately what is **planned** for
future phases. See `/docs/IMPLEMENTATION_PLAN.md` for phase-by-phase status.

## Guiding principle

> The LLM is never the source of truth for arithmetic. All financial
> calculations (cost, margin, profit, price floors/ceilings) are computed by
> deterministic, unit-tested TypeScript code. AI is used only for narrative
> explanation, classification, and judgment calls that are explicitly labeled
> as AI-generated and — where the pricing rules require it — gated behind
> human approval.

This mirrors the source task's core principle: optimize for **monthly
contribution profit**, not top-line revenue, and never let a language model
hallucinate a number that affects a customer's invoice.

## System layers

```
┌─────────────────────────────────────────────────────────────────────┐
│  Public marketing site (existing)                                   │
│  /, /[slug] service pages, /service-area/[slug], /blog, /contact...  │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Customer intake & repair lifecycle (existing)                       │
│  RepairRequestForm → /api/repair-requests → Repair/Device/Customer    │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Deterministic Pricing & Cost Engine  (NEW — src/lib/pricing/)       │
│  Pure functions, zero I/O, zero LLM calls, 100% unit-testable.       │
│  cost-engine.ts   → true cost / variable cost breakdown              │
│  pricing-engine.ts→ floor / competitive / recommended / premium /    │
│                      max-justified price + margin + profit/hour +    │
│                      price-action recommendation                     │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  AI Provider Abstraction  (NEW — src/lib/ai/)                        │
│  provider.ts → AIProvider interface, model routing, structured JSON  │
│  anthropic.ts → Anthropic Messages API implementation                │
│  none.ts      → deterministic fallback (no key configured)           │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Agent Layer  (NEW — src/lib/agents/)                                │
│  orchestrator.ts → routes a pricing question to the agents below,    │
│                     merges results, logs the run                     │
│  cost-agent.ts    → wraps the deterministic cost engine               │
│  pricing-agent.ts → wraps the deterministic pricing engine + asks     │
│                      the AI provider (if configured) for a plain-     │
│                      language explanation of the numbers already      │
│                      computed — never for the numbers themselves      │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Persistence (NEW Prisma models)                                     │
│  RepairCategory, PricingRule, PricingRecommendation, AgentRun,       │
│  SystemSetting                                                       │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  APIs  (NEW — src/app/api/pricing/*, src/app/api/admin/*)            │
│  POST /api/pricing/recommend, GET /api/pricing/history,              │
│  GET/PUT /api/admin/pricing-rules                                    │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Admin UI  (NEW — src/app/admin/pricing/*)                           │
│  Get a recommendation, see Floor/Competitive/Recommended/Premium,     │
│  expand "Why?", approve/reject/edit, edit global pricing rules        │
└─────────────────────────────────────────────────────────────────────┘
```

## Why the existing site was extended, not replaced

The repository already contains a production-grade Next.js 15 + TypeScript +
Prisma + PostgreSQL application: a full marketing site, a repair-intake
pipeline (`Customer` → `Device` → `Repair` → `RepairStatusEvent`), a
JWT-cookie admin session system, rate limiting, CSRF protection, and a
security-hardened file upload path. Per the engineering rules for this
project ("preserve working functionality... integrate into it rather than
destroying/rebuilding"), the revenue platform is additive:

- No existing model, route, or page was removed or renamed.
- `Repair` gained two *optional* fields (`repairCategoryId`,
  `estimatedTechnicianHours`) so pricing can be attached to a real ticket
  without breaking the existing intake flow.
- `UserRole` gained `OWNER`, `MANAGER`, `SALES` alongside the existing
  `SUPER_ADMIN`, `ADMIN`, `TECHNICIAN`, `FRONT_DESK` — additive enum values,
  no migration risk to existing rows.
- The existing admin session/auth system (`src/lib/auth.ts`,
  `src/middleware.ts`) is reused for the new `/admin/pricing/*` routes rather
  than building a parallel auth system.

## AI provider abstraction

`src/lib/ai/provider.ts` defines a single `AIProvider` interface:

```ts
interface AIProvider {
  readonly name: string
  complete(request: AICompletionRequest): Promise<AICompletionResult>
}
```

`getAIProvider(tier)` resolves an implementation from `AI_PROVIDER` env var:

- `"anthropic"` (default when `ANTHROPIC_API_KEY` is set) — calls the
  Anthropic Messages API directly via `fetch` (no SDK dependency added,
  keeping the footprint small). Model is chosen by `tier`:
  `AI_MODEL_FAST` for classification/explanation, `AI_MODEL_ADVANCED` for
  orchestration-level reasoning — implementing the AI-cost-control routing
  described in the spec ("simple tasks → cheap/fast model, complex
  reasoning → advanced model, deterministic calculations → NO LLM").
- `"none"` (default when no key is configured) — returns a deterministic,
  clearly-labeled explanation built from the same numbers the pricing engine
  already computed. This means **the pricing system is fully functional with
  zero AI spend**; the AI layer only adds narrative polish and free-text
  classification on top.

Adding a second real provider (OpenAI, etc.) means implementing the same
three-method interface and adding a branch in `getAIProvider` — nothing else
in the codebase depends on a specific vendor.

## Agent execution logging

Every orchestrator/agent invocation writes an `AgentRun` row: agent name,
input summary, output summary, model/provider used, latency, a rough token
estimate, confidence, and success/error status. This is the seed of the
"Agent Operations" observability described in the spec (§22); a full
dashboard is future work (see IMPLEMENTATION_PLAN.md).

## Human approval

`PricingRecommendation.requiresHumanApproval` is set by the deterministic
engine itself (not by the AI layer) whenever: the recommended price is below
the configured floor, the computed margin is below the minimum, risk flags
include `HIGH_RISK`, or confidence is below a configurable threshold.
Approval status (`PENDING_REVIEW` / `APPROVED` / `REJECTED` / `EDITED`) is
tracked on the same row, along with who acted and when — see
`/admin/pricing`.
