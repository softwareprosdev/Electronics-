import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { MARKETING_VIEW_ROLES, requireRole } from '@/lib/rbac'
import { runFunnelCheckIngest } from '@/lib/agents/marketing/guardian-agent'

// Ingest is called by scripts/marketing-swarm/funnel-health-check.mjs on a
// schedule (see .github/workflows/funnel-health-check.yml) — an external,
// unauthenticated caller, so it's protected by a shared secret rather than
// an admin session.
const submissionSchema = z.object({
  target: z.string().min(1).max(100),
  url: z.string().url(),
  httpStatus: z.number().int().nullable(),
  latencyMs: z.number().int().nullable(),
  expectedContentFound: z.boolean().nullable(),
  errorDetail: z.string().max(2000).nullable(),
})

const ingestSchema = z.object({ checks: z.array(submissionSchema).min(1).max(50) })

export async function POST(request: Request) {
  const secret = request.headers.get('x-funnel-check-secret')
  if (!secret || !process.env.FUNNEL_CHECK_SECRET || secret !== process.env.FUNNEL_CHECK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = ingestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const results = await runFunnelCheckIngest(parsed.data.checks)
    return NextResponse.json({ results }, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Funnel check ingest failed', error)
    return NextResponse.json({ error: 'Failed to record funnel checks.' }, { status: 500 })
  }
}

export async function GET() {
  const auth = await requireRole(MARKETING_VIEW_ROLES)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const checks = await prisma.funnelCheck.findMany({
    orderBy: { checkedAt: 'desc' },
    take: 100,
  })

  return NextResponse.json({ checks }, { headers: { 'Cache-Control': 'no-store' } })
}
