# Changelog

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
