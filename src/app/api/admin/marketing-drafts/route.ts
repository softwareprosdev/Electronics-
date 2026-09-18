import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isTrustedOrigin } from '@/lib/csrf'
import { MARKETING_VIEW_ROLES, requireRole } from '@/lib/rbac'
import { draftAdCopy } from '@/lib/agents/marketing/creative-agent'

export async function GET() {
  const auth = await requireRole(MARKETING_VIEW_ROLES)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const drafts = await prisma.marketingDraft.findMany({
    include: { reviewedBy: { select: { name: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ drafts }, { headers: { 'Cache-Control': 'no-store' } })
}

const generateSchema = z.object({
  channel: z.enum(['GOOGLE_SEARCH', 'GOOGLE_LSA', 'META', 'TIKTOK', 'YOUTUBE', 'EMAIL', 'ORGANIC_SITE']),
  brief: z.string().min(1).max(2000),
})

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const auth = await requireRole(MARKETING_VIEW_ROLES)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = generateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const result = await draftAdCopy(parsed.data)
    return NextResponse.json(result, { status: 201, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Marketing creative agent failed', error)
    return NextResponse.json({ error: 'Failed to generate ad copy.' }, { status: 500 })
  }
}
