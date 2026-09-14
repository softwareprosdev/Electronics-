# Implementation Plan & Status

The source specification (§44) lays out 8 phases covering a full revenue
intelligence platform: 15 AI agents, RAG, a B2B portal, forecasting, a
business simulator, marketing attribution, and more. That is genuinely
months of production engineering, several parts of which need data sources
(a market-pricing feed, marketing platform, B2B lead data) that are not
connected to this environment and cannot be faked without violating the
spec's own "no fake data" rule (§41).

This change delivers a **real, working, tested slice** of that platform —
the deterministic financial core plus a genuine (not mocked) AI agent layer
on top of it — fully integrated into the existing site, and documents the
rest as a sequenced roadmap.

## Delivered in this change

| Area | What was built | Status |
|---|---|---|
| Docs | 6 architecture docs in `/docs` | ✅ |
| Database | `RepairCategory`, `PricingRule`, `PricingRecommendation`, `AgentRun`, `SystemSetting`; `UserRole` extended (`OWNER`, `MANAGER`, `SALES`); `Repair`/`Technician` extended (additive, optional fields) | ✅ migrated |
| Cost engine | `src/lib/pricing/cost-engine.ts` — deterministic true-cost breakdown | ✅ unit tested |
| Pricing engine | `src/lib/pricing/pricing-engine.ts` — floor/competitive/recommended/premium/max price, margin, profit/hour, acceptance estimate, price action, approval gating | ✅ unit tested |
| AI provider abstraction | `src/lib/ai/provider.ts` + Anthropic implementation + no-op fallback, with fast/advanced model routing | ✅ |
| Agents | Orchestrator, Cost Agent, Pricing Agent — real, logged, AI-optional | ✅ |
| APIs | `POST /api/pricing/recommend`, `GET /api/pricing/history`, `GET/PUT /api/admin/pricing-rules` | ✅ |
| Admin UI | `/admin/pricing` (get a recommendation, review/approve/reject/edit), `/admin/pricing/rules` (edit the deterministic rule set) | ✅ |
| RBAC | Role-gated pricing routes reusing the existing session system | ✅ |
| Tests | Vitest unit tests for both engines, including the exact worked example from the source spec (§35) | ✅ |
| Site content | Two real laboratory photographs (microsoldering under a digital microscope; PCB diagnostic review) replacing the previous text-only "we repair the electronics inside" presentation on the homepage, per the §37 design direction against generic stock imagery | ✅ |

Acceptance criteria from §46 that are met by this change: repair pricing can
be classified into a `RepairCategory`, the pricing engine calculates
deterministic costs, the AI pricing agent produces a recommendation with
floor/target/expected-margin/expected-contribution-profit/profit-per-hour/
confidence, the recommendation can require human approval, a human can
approve/edit/reject it, agent executions are logged, AI cost is tracked
(token/cost estimate per run), role-based permissions are enforced, no
secrets are exposed, no fake market data is presented as real (competitive
price is `null` with an explicit "no market data" flag rather than
fabricated), production build/typecheck/lint/tests pass, and the database
migration applies cleanly.

## Roadmap (not built in this change, sequenced)

### Phase 4 — Technician Copilot, Repair Intelligence, RAG
Requires: enough completed-repair volume to be useful, plus a vector-search
index. Build order: (1) start recording `Diagnostic`/repair-outcome data
already possible via the existing `Diagnostic` model, (2) add
`KnowledgeDocument`/`KnowledgeChunk`/`Embedding` models + an ingestion job
for manuals/SOPs, (3) build the Copilot as a RAG agent over both.

### Phase 5 — Marketing ROI, B2B Prospecting, CRM, Lead Scoring
Requires: a connected marketing platform (ad spend data) and a legitimate
B2B data provider — neither is configured in this environment. Schema
(`Lead`, `LeadSource`, `MarketingCampaign`, `MarketingSpend`,
`MarketingAttribution`) is reserved in `DATABASE_ARCHITECTURE.md` so this
phase doesn't require renaming anything already shipped.

### Phase 6 — Forecasting, Capacity Optimization, Profit Leak Detection
Requires: a few months of real `PricingRecommendation`/repair-outcome
history to forecast or detect anomalies against meaningfully. The
`Technician.hourlyCostCents`/`capacityHoursPerWeek` fields added in this
change are the first building block; a `TechnicianTimeEntry` model
(actual hours logged per ticket) is the next piece needed for automatic
capacity-percent calculation (today it's a manual input to the pricing
API).

### Phase 7 — Executive Dashboard, Business Simulator, Automated Reports
An aggregation + presentation layer over Phases 4–6's data. Not
meaningfully buildable before there's real data to aggregate — building the
dashboard shell against empty tables would violate §41 ("Production
dashboard must never pretend demo data is real").

### Phase 8 — Production hardening at platform scale
The existing site's OWASP/NIST security audit (see `README.md` "Security")
already covers this codebase's baseline. Additional hardening (MFA, secrets
manager integration, structured logging/observability platform, load
testing) is a deployment-environment concern to revisit once Phases 4–7 add
enough attack surface to warrant it.

## Explicit non-goals of this change

- No B2B customer portal, batch intake, or CSV import (§16, §33) — no
  requirement or data model was exercised to justify building it now.
- No customer-facing quote page changes (§15) — the existing `Quote` model
  and admin flow are untouched; wiring AI-generated quote copy to it is
  natural Phase-5-adjacent follow-up once email delivery
  (`EMAIL_PROVIDER`) is a real provider instead of `console`.
- No business simulator / "what-if" tool (§31) — depends on Phase 6/7 data.
- No case-study engine (§28) — a content feature independent of the pricing
  platform; can be added anytime without touching this change's models.
