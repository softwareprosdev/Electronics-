#!/usr/bin/env node
// Self-healing (technical): checks the site's key public funnels are up
// and reports the results to the app, which alerts a human on anything
// not OK. Read-only against the site itself (GET requests only — it never
// submits a form, to avoid writing test data into the production
// database). See /docs/MARKETING_AI_ARCHITECTURE.md.
//
// Usage: SITE_URL=https://www.traceworkslab.com FUNNEL_CHECK_SECRET=... node funnel-health-check.mjs
// Exits non-zero if any check is DOWN, so CI can surface a failed run.

const SITE_URL = process.env.SITE_URL || 'https://www.traceworkslab.com'
const SECRET = process.env.FUNNEL_CHECK_SECRET

const TARGETS = [
  { target: 'homepage', path: '/', expectedText: 'TraceWorks Lab' },
  { target: 'contact-page', path: '/contact', expectedText: null },
  { target: 'request-repair-page', path: '/request-repair', expectedText: null },
  { target: 'sitemap', path: '/sitemap.xml', expectedText: '<urlset' },
]

async function checkOne({ target, path, expectedText }) {
  const url = `${SITE_URL}${path}`
  const startedAt = Date.now()
  try {
    const response = await fetch(url, { redirect: 'follow' })
    const latencyMs = Date.now() - startedAt
    const body = await response.text()
    const expectedContentFound = expectedText ? body.includes(expectedText) : null

    return {
      target,
      url,
      httpStatus: response.status,
      latencyMs,
      expectedContentFound,
      errorDetail: null,
    }
  } catch (err) {
    return {
      target,
      url,
      httpStatus: null,
      latencyMs: null,
      expectedContentFound: null,
      errorDetail: err instanceof Error ? err.message : String(err),
    }
  }
}

async function main() {
  const checks = await Promise.all(TARGETS.map(checkOne))

  for (const check of checks) {
    console.log(`${check.target}: status=${check.httpStatus ?? 'n/a'} latency=${check.latencyMs ?? 'n/a'}ms error=${check.errorDetail ?? 'none'}`)
  }

  if (SECRET) {
    const response = await fetch(`${SITE_URL}/api/admin/funnel-checks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-funnel-check-secret': SECRET,
      },
      body: JSON.stringify({ checks }),
    })
    if (!response.ok) {
      console.error(`Failed to report checks to app: HTTP ${response.status}`)
    }
  } else {
    console.warn('FUNNEL_CHECK_SECRET not set — results printed locally only, not reported to the app.')
  }

  const anyDown = checks.some(
    (c) => c.errorDetail || c.httpStatus == null || c.httpStatus >= 500 || c.expectedContentFound === false,
  )
  process.exit(anyDown ? 1 : 0)
}

main()
