# Changelog

## Unreleased — Revenue, Pricing & Profit Optimization Platform

Adds a deterministic pricing/cost engine and a real (non-mocked) AI agent
layer on top of it, integrated into the existing admin system. See
`/docs` for the full architecture and `docs/IMPLEMENTATION_PLAN.md` for
what's built versus sequenced as future work.

### Added

- Deterministic pricing/cost engine (`src/lib/pricing/`): true-cost
  breakdown, floor/competitive/recommended/premium/max-justified price,
  gross margin, profit per technician hour, acceptance-probability
  estimate, price-action recommendation, and human-approval gating — pure,
  zero-I/O, zero-LLM functions with 27 Vitest unit tests.
- AI provider abstraction (`src/lib/ai/`): a vendor-agnostic interface with
  an Anthropic implementation and a no-op fallback; every pricing
  recommendation works with zero AI spend, and the AI layer only ever adds
  narrative explanation / risk-flag classification on top of numbers the
  engine already computed.
- Agent layer (`src/lib/agents/`): Orchestrator, Cost Agent, and Pricing
  Agent, with every run logged to a new `AgentRun` table (agent
  operations observability).
- New Prisma models: `RepairCategory`, `PricingRule`,
  `PricingRecommendation`, `AgentRun`, `SystemSetting`; `UserRole` extended
  with `OWNER`, `MANAGER`, `SALES`; `Repair`/`Technician` extended with
  optional pricing-related fields.
- New APIs: `POST /api/pricing/recommend`, `GET /api/pricing/history`,
  `PATCH /api/pricing/recommendations/[id]`, `GET/PUT
  /api/admin/pricing-rules`, `GET/POST /api/admin/repair-categories`.
- New admin UI: `/admin/pricing` (generate and review recommendations,
  approve/reject/edit) and `/admin/pricing/rules` (edit the deterministic
  rule set), role-gated and linked from the admin nav.
- Six architecture docs in `/docs`.
- Two real laboratory photographs (microsoldering under a digital
  microscope; PCB diagnostic review) added to the homepage.

## Unreleased — Initial Release

Initial build of the Advanced Electronics Repair & Reprogramming Laboratory
website (Next.js 14 App Router, TypeScript, Tailwind CSS, Prisma/PostgreSQL).

### Added

- Homepage with hero, service categories, dead-board CTA, diagnostics
  process, industries served, local service area, mail-in repair, business
  partner program, and FAQ sections.
- 20 statically generated service pages (board-level, component-level,
  microsoldering, iPhone/iPad, NAND, motherboard, GPU, PS5/Xbox/Switch,
  automotive ECU/ECM/BCM, aviation electronics/avionics, ASIC/mining).
- 6 local-SEO service-area pages (Harlingen, Brownsville, Weslaco, McAllen,
  Mission, Edinburg).
- Multi-step repair request form with file upload, contact form, and
  business trade-account form, each backed by a validated, rate-limited API
  route.
- Session-authenticated admin dashboard with a repair queue and status
  workflow.
- Customer portal roadmap placeholder backed by a portal-ready schema.
- Prisma schema covering identity, catalog, repair workflow, content, and
  audit-log entities, with migrations and seed data.
- SEO infrastructure (sitemap, robots, JSON-LD), security headers/CSP,
  Docker + docker-compose, and README documentation.
