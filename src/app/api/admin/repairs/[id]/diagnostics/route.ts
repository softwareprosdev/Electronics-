import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const createSchema = z.object({
  findings: z.string().trim().min(1).max(4000),
  rootCause: z.string().trim().max(2000).optional().or(z.literal('')),
  isRepairable: z.enum(['true', 'false', 'unknown']),
})

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Findings are required.' }, { status: 400 })
  }

  const { findings, rootCause, isRepairable } = parsed.data

  try {
    const diagnostic = await prisma.diagnostic.create({
      data: {
        repairId: id,
        findings,
        rootCause: rootCause || undefined,
        isRepairable: isRepairable === 'unknown' ? null : isRepairable === 'true',
        performedBy: session.email,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'CREATE_DIAGNOSTIC',
        entityType: 'Repair',
        entityId: id,
        metadata: { diagnosticId: diagnostic.id },
      },
    })

    return NextResponse.json(
      { success: true, diagnostic },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2003') {
      return NextResponse.json({ error: 'Repair not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to save diagnostic.' }, { status: 500 })
  }
}
