# Agent Specifications

The source specification calls for 15 agents. This document records the
target design for all 15, and clearly marks which are **implemented**
(real, working code in this repository) versus **planned** (designed here,
not yet built — see `IMPLEMENTATION_PLAN.md` for sequencing). Building all
15 as genuine, tested, non-mocked systems — several of which require live
market-data integrations, an ingested knowledge base, and months of
production repair history to be useful at all — is out of scope for a single
change; shipping stubs that pretend to work would violate the project's own
"no fake data" rule (§41 of the source spec), so agents without a real data
source are documented, not faked.

## Implemented

### Agent 1 — Orchestrator (`src/lib/agents/orchestrator.ts`)
Routes a pricing question to the Cost Agent and Pricing Agent, merges their
output into one `PriceRecommendation`, and logs one `AgentRun` for the
orchestration itself plus one per sub-agent call. Human approval is a
property of the merged output, not a separate step, per
`PRICING_ENGINE.md`.

### Agent 3 — Cost Accounting Agent (`src/lib/agents/cost-agent.ts`)
Thin wrapper around `computeCostBreakdown()`. Does not call an LLM — cost
accounting is pure arithmetic over admin-configured rates (technician cost,
processing fees, shipping, consumables, warranty reserve, overhead
allocation).

### Agent 4 — Pricing Optimization Agent (`src/lib/agents/pricing-agent.ts`)
Wraps `recommendPrice()`. All floor/competitive/recommended/premium/max
numbers come from the deterministic engine. If an AI provider is
configured, the agent makes **one** call asking the model to (a) turn the
engine's `reasoning[]` bullets into a short natural-language narrative and
(b) classify any free-text symptom description into risk flags
(`LIQUID_DAMAGE_SUSPECTED`, `NO_POWER`, `INTERMITTENT`, etc.) — a
genuinely useful NLP task, not arithmetic. The model's output is validated
against a Zod schema before use; on any validation failure or provider
error, the agent silently falls back to the deterministic reasoning text
(never throws, never blocks a pricing decision on an AI outage).

## Planned (designed, not yet implemented)

Each entry below states what real data source it needs before it could
produce anything other than fabricated output — the reason it isn't built
yet.

| # | Agent | Needs before it can be real | Notes |
|---|-------|------------------------------|-------|
| 2 | Market Intelligence | A configured, ToS-compliant market-data provider (API or licensed feed). No such provider is connected in this environment. | `MarketPrice`/`MarketSource` schema already reserved (see DATABASE_ARCHITECTURE.md) so `pricing-engine.ts`'s `competitivePriceCents` can be populated the moment real observations exist — it already accepts them as an optional input and returns `null` + a "no market data" flag otherwise. |
| 5 | Demand / Elasticity | Enough historical `PricingRecommendation`/quote-outcome rows (dozens+ per category) to fit anything above a coin-flip. `pricing-engine.ts` already has the historical-acceptance code path; it just has no data to read from yet in a fresh deployment. |
| 6 | Repair Intelligence | A body of completed repairs with structured diagnostic data. The `Repair`/`Diagnostic` tables exist; this agent is a read/summarize layer over them once volume exists. |
| 7 | Technician Copilot | Same repair history dependency as #6, plus a RAG index (embeddings + vector search) which is infrastructure, not business data — feasible to build next, sequenced in IMPLEMENTATION_PLAN.md Phase 4. |
| 8 | Profit Strategist | Enough completed, priced repairs across categories to rank them meaningfully. Mechanically this is a SQL aggregation + AI summarization agent once `PricingRecommendation` volume exists. |
| 9 | Marketing ROI | Marketing spend/attribution data — no marketing platform is connected in this environment. |
| 10 | B2B Prospecting | The spec explicitly forbids fabricating company/contact information; this agent needs a legitimate B2B data provider before it can output anything. |
| 11 | Quote Agent | Builds on the existing `Quote` model + the (implemented) pricing engine; mechanical to add once quote-sending (email) is wired to a real provider (currently `EMAIL_PROVIDER=console`). |
| 12 | Capacity Agent | Needs `TechnicianTimeEntry`-level data (actual hours logged per ticket) which isn't collected yet — the schema note for it is in DATABASE_ARCHITECTURE.md. The *pricing engine* already accepts a manually supplied `technicianCapacityPercent` so capacity-aware pricing works today; the agent that computes that percentage automatically from time entries is future work. |
| 13 | Forecasting | Needs months of real revenue/volume history to forecast against. |
| 14 | Anomaly | Needs a baseline of "normal" over time before "anomalous" is meaningful. |
| 15 | Executive Advisor | A daily-briefing aggregator over #8/#9/#13/#14 — sequenced after those exist. |

## Design rules that apply to every agent (implemented or future)

1. **No agent computes money.** Every dollar figure a customer or manager
   sees traces to `src/lib/pricing/` or a direct database aggregation, never
   to an LLM completion.
2. **Every run is logged.** `AgentRun` records agent name, input/output
   summaries, model, latency, and a token/cost estimate — whether or not the
   run used an LLM at all (a "none" provider run is still logged, with
   `provider: "none"`).
3. **Distinguish fact from inference.** Any agent output that is not a
   direct database read must be labeled: `"known_fact"`, `"historical_evidence"`,
   `"hypothesis"`, or `"insufficient_data"`. `pricing-agent.ts`'s narrative
   generation follows this convention in its system prompt.
4. **Fail closed, not open.** An AI provider error never blocks a
   deterministic recommendation and never gets silently upgraded into a
   fabricated answer — it downgrades to the deterministic fallback and the
   `AgentRun.status` records the failure.
