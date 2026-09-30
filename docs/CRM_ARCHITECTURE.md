# CRM / Repair Operations System — Architecture Assessment & Phase Plan

Written before Phase 2 implementation, per the requirement to inspect and
assess before making major schema/architecture changes. Covers what exists
today, the decision to extend (not replace) the current application, and
the phased build order going forward.

## What exists today (inspected, not assumed)

- **Framework**: Next.js 15 App Router, TypeScript, Tailwind. Deployed on
  Vercel, PostgreSQL (Neon) via Prisma.
- **Auth**: Argon2id password hashing (migrated from bcrypt this session,
  transparent per-account migration on login), signed JWT session cookie
  (`jose`), self-service password reset (single-use, 30-min token, hash
  stored not raw token), route protection via `src/middleware.ts`.
- **RBAC**: `UserRole` enum exists (`SUPER_ADMIN, ADMIN, OWNER, MANAGER,
  SALES, TECHNICIAN, FRONT_DESK`) with role-gated sections
  (`src/lib/rbac.ts`) already wired into pricing/marketing admin pages.
- **Core models already in `prisma/schema.prisma`**: `User`, `Customer`,
  `BusinessAccount`, `Technician`, `Device`, `Repair` (with
  `RepairStatusEvent`, `Diagnostic`, `Quote`, `Attachment`, `Message`),
  `ContactSubmission`, `AuditLog`. Plus an existing, separate
  pricing-recommendation engine and a marketing-agent-draft system
  (`RepairCategory`, `PricingRule`, `PricingRecommendation`, `AgentRun`,
  `MarketingDraft`, `MarketingLesson`, `FunnelCheck`) — both already
  production-grade and out of scope for this CRM work.
- **Admin panel** (built this session): Dashboard (`/admin`), Repair Queue
  (`/admin/repairs`), Leads & Inquiries (`/admin/leads` — contact-form +
  business-account submissions with status/notes), Customers CRUD
  (`/admin/customers` — search, manual create, edit, per-customer repair
  history), Account (`/admin/account` — password change).
- **Public intake**: repair-request form writes directly to `Customer` +
  `Device` + `Repair` (a visitor who completes it is already
  qualified/ready — this is a deliberate simplification, not a bug).
  Contact form and business-account form write to `ContactSubmission` /
  `BusinessAccount` — these are the actual "someone reached out, not yet
  a formal repair request" entries, i.e. leads.

## Decision: extend, don't replace

This is one application, one Next.js project, one Postgres database. There
is no reason to stand up a separate CRM app — every entity the spec wants
(leads, customers, devices, repairs) already has a home in this schema or
a natural extension of it. Everything below adds to the existing schema
and admin panel; nothing already working is torn out.

## Phase status

- **Phase 1 (architecture, database, auth, RBAC)** — done as of this
  session (Argon2id, password reset, existing RBAC roles/gating).
- **Phase 2 (customers, leads, devices)** — Customers: done. Leads: the
  earlier `/admin/leads` page was a stopgap (a status field bolted onto
  the raw form-submission log). This phase replaces it with a real `Lead`
  entity and pipeline (see below) — the actual working sales record, not
  just an inbox. Devices: promoted to their own admin list/search page.
- **Phases 3–12** (diagnostics, estimates/invoices/payments, inventory,
  technician workspace + QC, customer portal, shipping/warranty, reports,
  AI assistant, automation, security/testing hardening) — not started.
  Each is a substantial, independent subsystem; they'll be built in this
  same phased, tested, incrementally-deployed way, one at a time.

## This phase's scope (Lead pipeline)

New `Lead` model, separate from `ContactSubmission` (which stays as the
immutable raw-submission audit log — never modified after creation).
`Lead` is the working record: stage, source, priority, assigned
technician, estimated value, follow-up date, notes, and a `convertedTo`
link to the `Customer` it becomes once qualified. Contact-form
submissions create both a `ContactSubmission` (audit) and a `Lead`
(workable pipeline record). A Kanban board in `/admin/leads` replaces the
old inbox list, with drag-and-drop stage changes and a "Convert to
Customer" action.
