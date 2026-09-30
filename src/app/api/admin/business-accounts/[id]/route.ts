import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const updateSchema = z.object({
  isApproved: z.boolean().optional(),
  notes: z.string().max(4000).optional(),
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

  const { isApproved, notes } = parsed.data

  try {
    const account = await prisma.businessAccount.update({
      where: { id },
      data: {
        isApproved: isApproved !== undefined ? isApproved : undefined,
        notes: notes !== undefined ? notes : undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'UPDATE_BUSINESS_ACCOUNT',
        entityType: 'BusinessAccount',
        entityId: account.id,
        metadata: { isApproved, notesUpdated: notes !== undefined },
      },
    })

    return NextResponse.json(
      { success: true, account },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json({ error: 'Business account not found.' }, { status: 404 })
  }
}
