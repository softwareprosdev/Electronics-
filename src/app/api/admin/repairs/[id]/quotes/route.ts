import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const createSchema = z.object({
  amountCents: z.number().int().min(0).max(100_000_00),
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
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'A valid amount is required.' }, { status: 400 })
  }

  const { amountCents, notes } = parsed.data

  try {
    const quote = await prisma.quote.create({
      data: {
        repairId: id,
        amountCents,
        notes: notes || undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'CREATE_QUOTE',
        entityType: 'Repair',
        entityId: id,
        metadata: { quoteId: quote.id, amountCents },
      },
    })

    return NextResponse.json(
      { success: true, quote },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2003') {
      return NextResponse.json({ error: 'Repair not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to create quote.' }, { status: 500 })
  }
}
