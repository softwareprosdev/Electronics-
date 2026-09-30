import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const repairStatusEnum = z.enum([
  'NEW',
  'UNDER_REVIEW',
  'DIAGNOSTIC_PENDING',
  'DIAGNOSING',
  'QUOTE_SENT',
  'APPROVED',
  'IN_REPAIR',
  'TESTING',
  'COMPLETED',
  'RETURN_SHIPPING',
  'CLOSED',
  'UNREPAIRABLE',
])

const updateSchema = z.object({
  status: repairStatusEnum.optional(),
  internalNotes: z.string().max(4000).optional(),
  statusNote: z.string().max(1000).optional(),
  qcOverrideReason: z.string().trim().min(1).max(1000).optional(),
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
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }

  const { status, internalNotes, statusNote, qcOverrideReason } = parsed.data

  // Quality-control gate (spec section 54): a repair cannot become
  // COMPLETED without QC having passed, unless an admin explicitly
  // overrides with a logged reason.
  let qcOverrideApplied = false
  if (status === 'COMPLETED') {
    const current = await prisma.repair.findUnique({
      where: { id },
      select: { qcPassedAt: true },
    })
    if (!current) {
      return NextResponse.json({ error: 'Repair not found.' }, { status: 404 })
    }
    if (!current.qcPassedAt) {
      if (!qcOverrideReason) {
        return NextResponse.json(
          { error: 'This repair has not passed QC yet. Record a QC pass first, or provide an override reason.' },
          { status: 400 },
        )
      }
      qcOverrideApplied = true
    }
  }

  try {
    const repair = await prisma.repair.update({
      where: { id },
      data: {
        status: status || undefined,
        internalNotes: internalNotes !== undefined ? internalNotes : undefined,
        statusHistory: status
          ? { create: { status, note: statusNote || undefined } }
          : undefined,
        ...(qcOverrideApplied
          ? {
              qcPassedAt: new Date(),
              qcPassedById: session.sub,
              qcNotes: `OVERRIDE: ${qcOverrideReason}`,
            }
          : {}),
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'UPDATE_REPAIR',
        entityType: 'Repair',
        entityId: repair.id,
        metadata: { status, internalNotesUpdated: internalNotes !== undefined },
      },
    })

    return NextResponse.json(
      { success: true, repair },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json({ error: 'Repair not found.' }, { status: 404 })
  }
}
