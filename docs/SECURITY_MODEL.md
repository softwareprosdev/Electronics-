# Security Model — Revenue/Pricing Platform Additions

This extends the existing security posture documented in the main
`README.md` ("Security" section — OWASP/NIST-audited). Everything below is
additive; none of the existing hardening (CSP, CSRF-by-Origin-check, rate
limiting, bcrypt/JWT admin sessions, file-signature validation) is changed.

## Authorization / RBAC

New routes are protected by the **same** session mechanism as the existing
`/admin/*` routes (`src/lib/auth.ts`, `src/middleware.ts`) — no parallel
auth system was introduced. A new helper, `requireRole()`
(`src/lib/rbac.ts`), narrows access per route:

| Route | Allowed roles |
|---|---|
| `GET /admin/pricing`, `GET /api/pricing/history` | `SUPER_ADMIN, ADMIN, OWNER, MANAGER` |
| `POST /api/pricing/recommend` | `SUPER_ADMIN, ADMIN, OWNER, MANAGER` |
| `GET /admin/pricing/rules`, `GET /api/admin/pricing-rules` | `SUPER_ADMIN, ADMIN, OWNER, MANAGER` (read-only for MANAGER) |
| `PUT /api/admin/pricing-rules` | `SUPER_ADMIN, ADMIN, OWNER` only |
| Approve/reject/edit a `PricingRecommendation` | `SUPER_ADMIN, ADMIN, OWNER, MANAGER` |

`TECHNICIAN`, `FRONT_DESK`, and `SALES` sessions receive `403` from every
pricing-rule-write endpoint; the pricing *view* endpoints are intentionally
withheld from `SALES`/`TECHNICIAN` in this pass since a pricing floor is
sensitive internal financial data (§20: "Never expose... internal pricing
rules" to anyone other than the roles who need them) — widening that access
is a product decision for a later phase, not a default.

## CSRF

`POST /api/pricing/recommend` and `PUT /api/admin/pricing-rules` reuse
`src/lib/csrf.ts`'s existing Origin/Referer verification, exactly like
`/api/admin/repairs/[id]`. No new CSRF mechanism was introduced.

## Rate limiting

`POST /api/pricing/recommend` is rate-limited using the existing
`src/lib/rate-limit.ts` limiter (same Upstash-backed / in-memory-fallback
implementation), keyed by session user id rather than IP (these are
authenticated admin endpoints, so per-user limiting is more meaningful than
per-IP) — this also bounds AI spend per user per window.

## Secrets

`ANTHROPIC_API_KEY` (and any future provider key) is read only from
`process.env` on the server; it is never sent to the client, never logged,
and never included in an `AgentRun.inputSummary`/`outputSummary` (those
store the prompt/response content, not headers/credentials). The existing
`.gitignore` already excludes `.env*`.

## AI-specific risks

- **Prompt injection from free text.** `pricing-agent.ts` passes
  customer-authored symptom text to the AI provider for risk-flag
  classification. The system prompt instructs the model to treat that text
  strictly as data to classify, never as instructions, and the model's
  output is constrained to a fixed Zod-validated enum/array shape — it
  cannot inject arbitrary text into the recommendation, only pick from a
  known set of risk flags or leave the set empty. There is no code path
  where AI output can change a price, a role, a database write beyond
  the `PricingRecommendation.reasoning`/`riskFlags` fields it's scoped to,
  or an authorization decision.
- **AI provider outage / bad output.** Every AI call is wrapped in
  try/catch with a deterministic fallback (see
  `REVENUE_AI_ARCHITECTURE.md`); a provider error degrades the UX (plainer
  reasoning text) but never blocks or corrupts a pricing decision, and is
  recorded as a failed `AgentRun` rather than surfaced as a fabricated
  success.
- **Data minimization.** Only the fields the AI actually needs are sent in
  the prompt (repair category, symptom text, the already-computed numeric
  reasoning) — no customer PII (name/email/phone/address) is included in
  any AI request.

## Financial-data integrity

- All money fields are integer cents end-to-end (database, engine, API) to
  avoid floating-point drift in stored financial records.
- `PricingRecommendation` rows are immutable once created (no `PATCH`); a
  human "edit" creates a status transition (`EDITED`) with `finalPriceCents`
  and `reviewedById`/`reviewedAt` set, preserving the original AI/engine
  output for audit — the same immutable-audit-trail pattern the existing
  `RepairStatusEvent` model already uses for repair status changes.

## Threats explicitly out of scope for this change

- Multi-tenant isolation (this is a single-business deployment; no tenant
  boundary exists anywhere in the codebase).
- MFA (the existing admin auth doesn't have it either; noted as a gap in
  the source spec's §2 "MFA-ready architecture" goal — the JWT session
  design doesn't preclude adding a TOTP step later, but none was added
  here).
