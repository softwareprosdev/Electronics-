# Marketing AI Agent Swarm — Architecture

This document describes the marketing agent layer built on top of the
existing site and the pricing/revenue platform (`/docs/REVENUE_AI_ARCHITECTURE.md`).
It reflects what is **actually implemented** today, and separately what is
**planned** — no live ad-platform (Google Ads, Meta, TikTok, YouTube)
integration is connected in this environment, matching Agent 9 ("Marketing
ROI") in `/docs/AGENT_SPECIFICATIONS.md`.

## Guiding principle

> An agent proposes; a human disposes. Every action the swarm can take —
> launching a campaign, changing a budget, publishing ad creative or a
> social post — is written as a `MarketingDraft` with status
> `PENDING_REVIEW`. Nothing in this codebase executes a draft automatically.
> The two exceptions are pure defensive/informational actions that spend no
> money and publish nothing: recording a funnel-health check, and emailing a
> human when one fails.

## System layers

```
┌─────────────────────────────────────────────────────────────────────┐
│  Guardrails (NEW — src/lib/marketing/guardrails.ts)                  │
│  Pure functions, zero I/O, zero LLM calls, unit-tested.               │
│  evaluateCampaignHealth() → WATCH / FLAG_FOR_REVIEW / AUTO_PAUSE /    │
│                              AUTO_REALLOCATE, from spend+leads vs.    │
│                              target CPL                               │
│  evaluateFunnelHealth()   → OK / DEGRADED / DOWN, from an HTTP check  │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Self-learning memory (NEW — src/lib/marketing/lessons.ts)           │
│  recordLesson() / getLessonsForChannel() over MarketingLesson —      │
│  every claim carries its evidence and a confidence label             │
│  (known_fact / historical_evidence / hypothesis / insufficient_data) │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Agent layer (NEW — src/lib/agents/marketing/)                       │
│  guardian-agent.ts  → runFunnelCheckIngest() records checks and       │
│                        emails a human immediately on DEGRADED/DOWN    │
│                        (informational only — no spend, no publish);  │
│                        evaluateAndDraftCampaignActions() runs         │
│                        guardrails over spend/lead signals and drafts │
│                        the recommended action (no live caller yet —  │
│                        needs a connected ad platform)                │
│  creative-agent.ts  → draftAdCopy() reads this channel's past        │
│                        lessons, asks the AI provider (if configured) │
│                        for headlines/primary text informed by them,  │
│                        and writes an AD_CREATIVE draft               │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Persistence (NEW Prisma models)                                     │
│  MarketingDraft, MarketingLesson, FunnelCheck                        │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  APIs (NEW)                                                          │
│  GET/POST /api/admin/marketing-drafts, PATCH .../[id]                │
│  POST (shared-secret ingest) + GET (admin) /api/admin/funnel-checks  │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  Admin UI (NEW — /admin/marketing)                                   │
│  Funnel status at a glance, generate a new ad-copy draft, approve/   │
│  reject pending drafts                                                │
└─────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────────┐
│  External runner (NEW — scripts/marketing-swarm/,                    │
│  .github/workflows/funnel-health-check.yml)                          │
│  A scheduled GitHub Action runs funnel-health-check.mjs every 30     │
│  minutes against the live site (read-only GETs, never submits a      │
│  form) and reports results to the ingest endpoint                    │
└─────────────────────────────────────────────────────────────────────┘
```

## Self-healing, precisely

Two different things both get called "self-healing" in this system —
worth keeping distinct:

1. **Technical (implemented, autonomous):** the funnel-health-check script
   catches a broken page, API route, or sitemap and the guardian agent
   emails a human immediately. This is autonomous because it only detects
   and alerts — it spends nothing and publishes nothing, so it doesn't
   need the approval gate.
2. **Campaign (implemented, draft-gated):** `evaluateCampaignHealth()`
   recommends pausing or reallocating budget away from an underperforming
   channel. This touches live ad spend, so per the swarm's approval
   policy it always produces a `MarketingDraft`, never an executed
   action — even though the underlying guardrail logic supports
   `AUTO_PAUSE`/`AUTO_REALLOCATE` as *recommendations*. There is no
   scheduled caller for this path yet, because no ad-platform integration
   exists to supply real spend/lead signals (see Agent 9 in
   `/docs/AGENT_SPECIFICATIONS.md`).

## Self-learning, precisely

`MarketingLesson` is the persistent memory: a channel, a tag (e.g.
`"before-after-creative"`), a one-sentence summary, its evidence (raw
metrics), and a confidence label. `draftAdCopy()` reads a channel's recent
lessons and includes them in the prompt before generating new copy, so
each cycle is informed by the last one — a real feedback loop, not just a
label. Nothing writes a lesson automatically yet (that requires real
campaign outcome data); `recordLesson()` is ready for the orchestrator or
an admin to call once outcomes exist to learn from.

## What's implemented vs. planned

| Capability | Status |
|---|---|
| Funnel health checks (detect + alert) | **Implemented** — real, scheduled, alerts today |
| Guardrail evaluation (campaign health → draft) | **Implemented** as a function; no live caller (needs an ad platform) |
| Ad copy drafting informed by past lessons | **Implemented** — AI-assisted with a deterministic fallback |
| Draft approval workflow | **Implemented** — `/admin/marketing` |
| Recording lessons from real outcomes | **Implemented** as a function (`recordLesson`); nothing calls it yet — needs real campaign results to learn from |
| Launching a campaign on Google/Meta/TikTok | **Planned** — blocked on connecting that platform's API credentials |
| Publishing a social post | **Planned** — blocked on connecting that platform's API credentials |
| Auto-executing a campaign pause/reallocation | **Not planned as default** — this system's approval policy keeps it draft-gated even once ad platforms are connected, unless that policy is deliberately changed |
