# Advanced Electronics Repair & Reprogramming Laboratory

Production-grade website for a board-level and component-level electronics
repair laboratory serving Harlingen, TX through Mission, TX and the Rio
Grande Valley, with mail-in repair available nationwide.

Built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Prisma, and
PostgreSQL.

## Table of Contents

- [Architecture](#architecture)
- [Revenue, Pricing & Profit Optimization Platform](#revenue-pricing--profit-optimization-platform)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Docker](#docker)
- [Project Structure](#project-structure)
- [API Routes](#api-routes)
- [Admin Dashboard](#admin-dashboard)
- [Customer Portal (Roadmap)](#customer-portal-roadmap)
- [SEO](#seo)
- [Security](#security)
- [Content Model](#content-model)
- [Testing Checklist](#testing-checklist)

## Architecture

The site is a single Next.js application combining:

1. **Marketing site** — statically generated homepage, 20 service pages, 6
   local-SEO service-area pages, blog, FAQ, business/partner pages. Content
   for these pages lives in `src/lib/data/*.ts` so pages build without a
   database connection and stay fast (SSG) and cacheable.
2. **Lead-generation forms** — a multi-step repair request form, a contact
   form, and a business trade-account form, each backed by an API route
   that validates input with Zod, rate-limits by IP, and writes to Postgres
   via Prisma.
3. **Admin dashboard** (`/admin`) — session-cookie-authenticated (JWT via
   `jose`, bcrypt-hashed passwords), server-rendered, reads/writes the
   repair queue directly from Postgres. Protected by `src/middleware.ts`.
4. **Customer portal** (`/portal`) — a roadmap placeholder page. The
   database schema (`Customer`, `Repair`, `Quote`, `Message`, `Attachment`)
   is already shaped to support a future self-service portal without
   migration changes.

## Revenue, Pricing & Profit Optimization Platform

Layered on top of the marketing site and repair-ticket system is a
deterministic pricing/cost engine plus an AI agent layer that explains and
contextualizes it — never one that computes it. Full design docs live in
`/docs`:

- [`REVENUE_AI_ARCHITECTURE.md`](docs/REVENUE_AI_ARCHITECTURE.md) — system layers, AI provider abstraction, agent logging, human approval
- [`PRICING_ENGINE.md`](docs/PRICING_ENGINE.md) — the deterministic cost/pricing math, worked example, edge cases
- [`AGENT_SPECIFICATIONS.md`](docs/AGENT_SPECIFICATIONS.md) — all 15 agents from the source spec: which 3 are real, and why the rest are documented rather than faked
- [`DATABASE_ARCHITECTURE.md`](docs/DATABASE_ARCHITECTURE.md) — new Prisma models and why
- [`SECURITY_MODEL.md`](docs/SECURITY_MODEL.md) — RBAC, CSRF, AI-specific risks (prompt injection, provider outage)
- [`IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — what's built vs. sequenced roadmap, and why

**Try it**: sign in to `/admin` with a `SUPER_ADMIN`/`ADMIN`/`OWNER`/`MANAGER`
account, then visit `/admin/pricing` to generate a recommendation (floor /
competitive / recommended / premium price, margin, profit/hour, confidence,
a "Why?" breakdown) and `/admin/pricing/rules` to edit the underlying
business rules — nothing is hard-coded. Everything works with **zero AI
spend**: leave `ANTHROPIC_API_KEY` unset and the engine still produces full
recommendations, just with a code-generated explanation instead of an
AI-written one.

## Tech Stack

| Concern        | Choice                                             |
| --------------- | --------------------------------------------------- |
| Framework       | Next.js 15 (App Router, Route Handlers)             |
| Language        | TypeScript (strict mode)                            |
| Styling         | Tailwind CSS (dark, technical/laboratory theme)     |
| Database        | PostgreSQL                                          |
| ORM             | Prisma                                               |
| Validation      | Zod                                                   |
| Admin auth      | Signed JWT session cookie (`jose`) + bcrypt          |
| File storage    | Abstracted adapter (`src/lib/storage.ts`), S3-ready  |
| Email/SMS       | Provider-abstracted (`src/lib/notify.ts`)            |
| Deployment      | Docker / docker-compose                              |

## Getting Started

```bash
npm install
cp .env.example .env
# edit .env — at minimum set DATABASE_URL and ADMIN_SESSION_SECRET

npx prisma migrate dev --name init
npm run prisma:seed   # creates the admin user + service categories + locations

npm run dev
```

The site runs at `http://localhost:3000`. Sign in to `/admin/login` with
`ADMIN_EMAIL` and the password you hashed into `ADMIN_PASSWORD_HASH` (see
below), or the seed script's fallback of `ChangeMe123!` if you didn't set
one.

### Generating an admin password hash

```bash
node -e "require('bcryptjs').hash('yourpassword', 12).then(console.log)"
```

Put the result in `ADMIN_PASSWORD_HASH` before running the seed script (or
update the `User` row directly).

## Environment Variables

See `.env.example` for the full list. Key variables:

- `DATABASE_URL` — PostgreSQL connection string.
- `NEXT_PUBLIC_SITE_URL` — canonical site URL, used for metadata, JSON-LD,
  and the sitemap.
- `ADMIN_SESSION_SECRET` — random string (32+ chars) used to sign admin
  session JWTs. **Required** — the app throws on startup of any admin route
  without it.
- `STORAGE_*` — S3-compatible object storage for repair attachments. When
  unset, uploads fall back to a local, non-public directory for development
  only (see `src/lib/storage.ts`).
- `EMAIL_PROVIDER` / `SMS_PROVIDER` — defaults to `console` (logs instead of
  sending). Swap in a real provider by extending `src/lib/notify.ts`.

## Database

The Prisma schema (`prisma/schema.prisma`) models:

- **Identity**: `User` (admin/technician accounts), `Customer`,
  `BusinessAccount`, `Technician`.
- **Catalog**: `ServiceCategory`, `Service`, `Location`.
- **Repair workflow**: `Device`, `Repair`, `RepairStatusEvent`,
  `Diagnostic`, `Quote`, `Attachment`, `Message`.
- **Content**: `FAQ`, `BlogPost`, `Testimonial`, `ContactSubmission`.
- **Audit**: `AuditLog`.
- **Pricing/revenue platform**: `RepairCategory`, `PricingRule`,
  `PricingRecommendation`, `AgentRun`, `SystemSetting` — see
  [`docs/DATABASE_ARCHITECTURE.md`](docs/DATABASE_ARCHITECTURE.md).

`Repair.status` moves through the full lifecycle specified for the
business: `NEW → UNDER_REVIEW → DIAGNOSTIC_PENDING → DIAGNOSING →
QUOTE_SENT → APPROVED → IN_REPAIR → TESTING → COMPLETED →
RETURN_SHIPPING → CLOSED`, with `UNREPAIRABLE` as a terminal branch.

Run migrations and seed data:

```bash
npx prisma migrate dev
npm run prisma:seed
```

`npm run prisma:generate` regenerates the Prisma client (also runs
automatically via `postinstall`).

## Docker

```bash
docker compose up --build
```

This starts Postgres and the Next.js app (standalone output). On first run,
apply migrations and seed data against the containerized database:

```bash
docker compose exec web npx prisma migrate deploy
docker compose exec web npx prisma db seed
```

Set a real `ADMIN_PASSWORD_HASH` in `docker-compose.yml` (or an `.env` file
referenced by it) before deploying — the default is empty.

## Project Structure

```
docs/                   Revenue/pricing platform architecture docs
prisma/
  schema.prisma        Data model
  seed.ts               Seed script (admin user, categories, locations,
                         repair categories, default pricing rule)
src/
  app/
    page.tsx             Homepage
    [slug]/               20 flat SEO service pages (generateStaticParams)
    service-area/[slug]/  6 local-SEO location pages
    mail-in-repair/, business-services/, repair-shop-partner-program/,
    contact/, faq/, blog/, blog/[slug]/, request-repair/, portal/,
    privacy/, terms/, repair-policy/
    admin/                Session-protected dashboard (login, queue, detail,
                           pricing/, pricing/rules/)
    api/                  Route handlers (repair-requests, contact,
                           business-accounts, admin/login, admin/logout,
                           admin/repairs/[id], pricing/recommend,
                           pricing/history, pricing/recommendations/[id],
                           admin/pricing-rules, admin/repair-categories)
    sitemap.ts, robots.ts, not-found.tsx, error.tsx, loading.tsx
  components/            Shared UI (Header, Footer, forms, JSON-LD, etc.)
    admin/                Pricing recommendation form/list, pricing rule form
  lib/
    data/                 Static content: services.ts, locations.ts,
                           faqs.ts, blog.ts
    pricing/               Deterministic cost/pricing engine (pure, unit-tested)
    ai/                    AI provider abstraction (Anthropic + no-op fallback)
    agents/                Orchestrator, Cost Agent, Pricing Agent
    prisma.ts, auth.ts, rbac.ts, validation.ts, rate-limit.ts, storage.ts,
    notify.ts, seo.ts, site-config.ts, pricing-rule-store.ts
  middleware.ts           Protects /admin/* routes
```

## API Routes

All routes validate input with Zod, rate-limit by client IP, and reject
honeypot-filled submissions silently (bot mitigation) without leaking that
detection to the caller.

| Route                              | Method | Purpose                                                   |
| ----------------------------------- | ------ | ----------------------------------------------------------- |
| `/api/repair-requests`             | POST   | Multi-step repair request submission (multipart, up to 6 files, 8MB each, MIME- and signature-validated) |
| `/api/contact`                     | POST   | General/business/partner/media contact form                |
| `/api/business-accounts`           | POST   | Trade account request (upserts by email)                   |
| `/api/admin/login`                 | POST   | Admin session login (bcrypt + signed JWT cookie)            |
| `/api/admin/logout`                | POST   | Clears the admin session cookie                             |
| `/api/admin/repairs/[id]`          | PATCH  | Update repair status / internal notes (session-protected)   |
| `/api/pricing/recommend`           | POST   | Run the pricing orchestrator (Cost Agent + Pricing Agent), persist and return a `PricingRecommendation` (role-protected) |
| `/api/pricing/history`             | GET    | List recent pricing recommendations, filterable by category/status (role-protected) |
| `/api/pricing/recommendations/[id]`| PATCH  | Approve / reject / edit a pending recommendation (role-protected) |
| `/api/admin/pricing-rules`         | GET/PUT| Read/update the global deterministic pricing rule set (PUT restricted to ADMIN/OWNER/SUPER_ADMIN) |
| `/api/admin/repair-categories`     | GET/POST| List/create priceable repair categories (POST restricted to ADMIN/OWNER/SUPER_ADMIN) |

## Admin Dashboard

- `/admin/login` — email/password sign-in.
- `/admin` — repair queue, filterable by status, counts per status.
- `/admin/repairs/[id]` — customer, equipment, failure details, attachments,
  status history, and a form to change status / add internal technician
  notes (writes a `RepairStatusEvent` audit trail entry on every status
  change, plus an `AuditLog` row).

Session cookies are `httpOnly`, `sameSite=lax`, and `secure` in production.
`src/middleware.ts` redirects unauthenticated requests to any `/admin/*`
route (other than `/admin/login`) to the login page.

## Customer Portal (Roadmap)

`/portal` is a placeholder describing planned functionality. The schema
already supports it: every `Repair` is tied to a `Customer`, with `Quote`,
`Message`, and `Attachment` records ready to expose through a future
authenticated customer-facing view.

## SEO

- `generateMetadata` on every dynamic route (service pages, location pages,
  blog posts) with unique titles/descriptions and canonical URLs.
- OpenGraph + Twitter card defaults in the root layout.
- JSON-LD: `Organization`, `WebSite`, `ElectronicsStore` (LocalBusiness),
  `Service`, `FAQPage`, and `BreadcrumbList` (see `src/lib/seo.ts`).
- `src/app/sitemap.ts` and `src/app/robots.ts` generate `/sitemap.xml` and
  `/robots.txt` dynamically from the same content data used to render pages
  (no drift between what's listed and what's live).
- Every service and location page has genuinely distinct copy (symptoms,
  what-we-evaluate lists, local context) rather than templated
  find-and-replace text, to avoid doorway-page duplication.
- Security headers, including a Content-Security-Policy, are set in
  `next.config.mjs`.

## Security

Audited against the OWASP Top 10 / ASVS and NIST SP 800-53/63B hardening
guidance. Findings and fixes:

- **Dependency CVEs (critical)** — upgraded Next.js 14.2.35 → 15.5.25,
  which was carrying dozens of published advisories including two
  unauthenticated **remote code execution** CVEs
  ([GHSA-p293-qw3h-jr36](https://github.com/advisories/GHSA-p293-qw3h-jr36),
  [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4)).
  One residual `npm audit` finding remains (PostCSS, bundled inside Next's
  own build tooling) — it only processes this repo's own trusted CSS at
  build time, never attacker-controlled input, so it's tracked but not
  urgent; closing it fully requires ESLint 9 (Next 16's peer requirement).
- **XSS defense-in-depth** — removed the one non-essential
  `dangerouslySetInnerHTML` call in the codebase; the remaining one
  (`JsonLd`, for `<script type="application/ld+json">` structured data)
  escapes `<`, `>`, and U+2028/U+2029 to prevent `</script>` breakout, even
  though its inputs are static site content today, not user input.
- **CSRF** — every state-changing API route (`repair-requests`, `contact`,
  `business-accounts`, `admin/login`, `admin/logout`,
  `admin/repairs/[id]`) now verifies the request's `Origin` (falling back
  to `Referer`) matches the app's own host before processing, per the
  OWASP CSRF Cheat Sheet, on top of the existing `sameSite=lax` cookie.
- **Auth timing side-channel** — `/api/admin/login` used to skip the
  bcrypt comparison entirely for a nonexistent/inactive email, making the
  endpoint measurably faster for unknown emails than known ones (a classic
  user-enumeration timing oracle). It now always runs `bcrypt.compare`
  against a fixed dummy hash so response time doesn't leak account
  existence.
- **Broken access control** — `/api/business-accounts` used to `upsert` by
  email with no authentication, so anyone who learned an existing trade
  partner's email could silently overwrite their approved business
  profile. It now refuses to mutate a record once `isApproved` is true.
- **File upload validation** — a client's declared `file.type` is
  spoofable metadata; uploads are now verified against the actual file
  signature ("magic bytes") for every allowed type before being written to
  disk, not just the declared MIME type. The storage path is also built
  entirely from a fixed MIME→extension map and a sanitized scope key
  (never from the client-supplied filename), with a resolved-path
  containment check as defense-in-depth.
- **Resource-consumption limits (OWASP API4)** — added explicit
  `Content-Length` pre-checks on all POST routes so oversized bodies are
  rejected before being parsed, and lowered the per-file attachment cap
  from 25MB to 8MB to match realistic serverless request-body limits.
- **Availability** — a failed attachment (invalid file, or a storage
  backend outage) no longer aborts the entire repair-request submission;
  it's skipped and logged instead, so a customer's report never gets lost
  over one broken photo upload.
- **Weak key length** — `ADMIN_SESSION_SECRET` is now required to be
  32+ characters (NIST SP 800-63B / RFC 2104's minimum for an HMAC-SHA256
  key), up from the previous unenforced 16.
- **Rate limiting reliability** — the limiter now uses a shared
  Upstash Redis counter when `UPSTASH_REDIS_REST_URL`/`_TOKEN` are
  configured, since a plain in-memory `Map` doesn't reliably enforce a
  limit across separate serverless function invocations. Falls back to
  in-memory for local dev / single-instance Docker.
- Zod validation on every form submission (client and server).
- Honeypot fields on all public forms.
- Admin sessions: bcrypt password hashing, signed JWT cookies
  (`httpOnly`, `sameSite=lax`, `secure` in production), route protection
  via middleware.
- Security headers applied globally: CSP, HSTS, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy, Permissions-Policy,
  Cross-Origin-Opener-Policy, Cross-Origin-Resource-Policy, and
  X-Permitted-Cross-Domain-Policies.
  `script-src` keeps `'unsafe-inline'` as a deliberate, documented
  trade-off: a per-request CSP nonce would force every statically
  generated page into dynamic rendering (see `next.config.mjs` for the
  full rationale) and there is no `dangerouslySetInnerHTML` anywhere in
  the app that renders anything other than static, developer-authored
  content.
- `AuditLog` records admin logins and repair status/notes changes.
- No customer or diagnostic data is exposed on public pages.

## Content Model

Marketing copy for services, locations, and FAQs lives in
`src/lib/data/*.ts` rather than the database, by design: it lets the 20
service pages and 6 location pages statically generate and CDN-cache
without a database round-trip, while `ServiceCategory`, `Service`, and
`Location` Prisma models exist so this content can be migrated into an
admin-editable CMS later without a schema change.

## Testing Checklist

Verified against a local PostgreSQL instance:

- [x] `npm run build` — production build succeeds, 0 TypeScript errors
- [x] `npm run lint` — 0 ESLint warnings/errors
- [x] All 20 service pages + 6 location pages + 8 blog posts statically generate
- [x] `/sitemap.xml` and `/robots.txt` render correctly
- [x] 404 page renders for unknown routes
- [x] Repair request form submits end-to-end (writes Customer, Device,
      Repair, RepairStatusEvent)
- [x] Contact form and business account form submit end-to-end
- [x] Rate limiting returns 429 once the per-IP threshold is exceeded
- [x] Admin login issues a session cookie; `/admin` redirects to login
      without one
- [x] Admin repair queue lists submitted requests; detail page updates
      status and internal notes
- [x] Docker `standalone` build produces a runnable server bundle
- [x] `npm test` (Vitest) — 27 unit tests covering the deterministic cost
      and pricing engines, including the exact worked example from
      `docs/PRICING_ENGINE.md`
- [x] `POST /api/pricing/recommend` → `PATCH /api/pricing/recommendations/[id]`
      exercised end-to-end against a local PostgreSQL instance: generates a
      recommendation, persists it with linked `AgentRun` rows, and approves
      it
- [x] `/admin/pricing` and `/admin/pricing/rules` render and are role-gated
- [x] Pricing agent fails closed with zero AI provider configured (verified:
      `AgentRun.succeeded = false`, `provider = "none"`, deterministic
      narrative still returned, recommendation unaffected)

Not exercised in this environment (no browser automation / real SMTP / S3
available here): visual cross-browser QA, live email/SMS delivery, and
production S3 uploads. Wire up real `EMAIL_PROVIDER`/`SMS_PROVIDER`/
`STORAGE_*` credentials before going live, and run a manual pass in Chrome,
Safari, and Firefox at desktop/tablet/mobile widths.
