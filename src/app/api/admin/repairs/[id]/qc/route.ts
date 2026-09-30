import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const createSchema = z.object({
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
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
    body = {}
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.' }, { status: 400 })
  }

  try {
    const repair = await prisma.repair.update({
      where: { id },
      data: {
        qcPassedAt: new Date(),
        qcPassedById: session.sub,
        qcNotes: parsed.data.notes || undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'QC_PASS',
        entityType: 'Repair',
        entityId: id,
      },
    })

    return NextResponse.json(
      { success: true, repair },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Repair not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to record QC pass.' }, { status: 500 })
  }
}
