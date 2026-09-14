import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { isTrustedOrigin } from '@/lib/csrf'
import { PRICING_RULE_EDIT_ROLES, PRICING_VIEW_ROLES, requireRole } from '@/lib/rbac'

export async function GET() {
  const auth = await requireRole(PRICING_VIEW_ROLES)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const categories = await prisma.repairCategory.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
  })

  return NextResponse.json({ categories }, { headers: { 'Cache-Control': 'no-store' } })
}

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const createSchema = z.object({
  slug: z.string().min(2).max(150).regex(slugPattern, 'Use lowercase letters, numbers, and hyphens only.'),
  name: z.string().min(2).max(200),
  description: z.string().max(2000).optional(),
  riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  defaultLaborHours: z.number().min(0).max(200),
  defaultDiagnosticHours: z.number().min(0).max(50).optional(),
  defaultPartsCostCents: z.number().int().min(0).max(100_000_00).optional(),
})

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const auth = await requireRole(PRICING_RULE_EDIT_ROLES)
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten() }, { status: 400 })
  }

  try {
    const category = await prisma.repairCategory.create({ data: parsed.data })
    return NextResponse.json({ category }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'A repair category with that slug already exists.' }, { status: 409 })
  }
}
