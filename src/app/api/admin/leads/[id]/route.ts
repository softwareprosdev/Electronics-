import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const pipelineStatuses = [
  'NEW',
  'CONTACTED',
  'QUALIFIED',
  'DIAGNOSTIC_PENDING',
  'ESTIMATE_PENDING',
  'ESTIMATE_SENT',
  'FOLLOW_UP',
  'APPROVED',
  'CONVERTED',
  'LOST',
] as const

const updateSchema = z.object({
  status: z.enum(pipelineStatuses).optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  assignedToId: z.string().nullable().optional(),
  notes: z.string().max(4000).optional(),
  followUpDate: z.string().datetime().nullable().optional(),
  estimatedValueCents: z.number().int().min(0).nullable().optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  try {
    const lead = await prisma.lead.update({
      where: { id },
      data: {
        status: data.status,
        priority: data.priority,
        assignedToId: data.assignedToId !== undefined ? data.assignedToId : undefined,
        notes: data.notes,
        followUpDate:
          data.followUpDate !== undefined
            ? data.followUpDate
              ? new Date(data.followUpDate)
              : null
            : undefined,
        estimatedValueCents: data.estimatedValueCents,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'UPDATE_LEAD',
        entityType: 'Lead',
        entityId: lead.id,
        metadata: { status: data.status },
      },
    })

    return NextResponse.json({ success: true, lead }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update lead.' }, { status: 500 })
  }
}
