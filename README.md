# Advanced Electronics Repair & Reprogramming Laboratory

Production-grade website for a board-level and component-level electronics
repair laboratory serving Harlingen, TX through Mission, TX and the Rio
Grande Valley, with mail-in repair available nationwide.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, Prisma, and
PostgreSQL.

## Table of Contents

- [Architecture](#architecture)
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

## Tech Stack

| Concern        | Choice                                             |
| --------------- | --------------------------------------------------- |
| Framework       | Next.js 14 (App Router, Route Handlers)             |
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
prisma/
  schema.prisma        Data model
  seed.ts               Seed script (admin user, categories, locations)
src/
  app/
    page.tsx             Homepage
    [slug]/               20 flat SEO service pages (generateStaticParams)
    service-area/[slug]/  6 local-SEO location pages
    mail-in-repair/, business-services/, repair-shop-partner-program/,
    contact/, faq/, blog/, blog/[slug]/, request-repair/, portal/,
    privacy/, terms/, repair-policy/
    admin/                Session-protected dashboard (login, queue, detail)
    api/                  Route handlers (repair-requests, contact,
                           business-accounts, admin/login, admin/logout,
                           admin/repairs/[id])
    sitemap.ts, robots.ts, not-found.tsx, error.tsx, loading.tsx
  components/            Shared UI (Header, Footer, forms, JSON-LD, etc.)
  lib/
    data/                 Static content: services.ts, locations.ts,
                           faqs.ts, blog.ts
    prisma.ts, auth.ts, validation.ts, rate-limit.ts, storage.ts,
    notify.ts, seo.ts, site-config.ts
  middleware.ts           Protects /admin/* routes
```

## API Routes

All routes validate input with Zod, rate-limit by client IP, and reject
honeypot-filled submissions silently (bot mitigation) without leaking that
detection to the caller.

| Route                              | Method | Purpose                                                   |
| ----------------------------------- | ------ | ----------------------------------------------------------- |
| `/api/repair-requests`             | POST   | Multi-step repair request submission (multipart, up to 6 files, 25MB each, MIME-validated) |
| `/api/contact`                     | POST   | General/business/partner/media contact form                |
| `/api/business-accounts`           | POST   | Trade account request (upserts by email)                   |
| `/api/admin/login`                 | POST   | Admin session login (bcrypt + signed JWT cookie)            |
| `/api/admin/logout`                | POST   | Clears the admin session cookie                             |
| `/api/admin/repairs/[id]`          | PATCH  | Update repair status / internal notes (session-protected)   |

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

- Zod validation on every form submission (client and server).
- Per-IP rate limiting on all POST routes (in-memory by default; swap for
  Upstash Redis in multi-instance deployments).
- Honeypot fields on all public forms.
- Admin sessions: bcrypt password hashing, signed JWT cookies
  (`httpOnly`, `sameSite=lax`, `secure` in production), route protection
  via middleware.
- File uploads: MIME allowlist, 25MB size cap, private storage (never
  publicly addressable); the storage adapter is written to be swapped for a
  real S3-compatible bucket without touching call sites.
- Security headers (CSP, HSTS, X-Frame-Options, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy) applied globally.
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

Not exercised in this environment (no browser automation / real SMTP / S3
available here): visual cross-browser QA, live email/SMS delivery, and
production S3 uploads. Wire up real `EMAIL_PROVIDER`/`SMS_PROVIDER`/
`STORAGE_*` credentials before going live, and run a manual pass in Chrome,
Safari, and Firefox at desktop/tablet/mobile widths.
