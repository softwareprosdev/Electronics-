import { NextResponse } from 'next/server'
import { randomBytes } from 'node:crypto'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const createSchema = z.object({
  amountCents: z.number().int().min(0).max(100_000_00),
  dueDate: z.string().datetime().nullable().optional(),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
})

// Readable, collision-resistant invoice number — INV-YYYYMMDD-XXXX. Not a
// gapless sequence (see spec section 60's "configurable invoice numbering"),
// but sequential numbering under concurrent serverless writes needs a
// transaction/counter table, which is real scope on its own; deferred.
function generateInvoiceNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = randomBytes(2).toString('hex').toUpperCase()
  return `INV-${date}-${suffix}`
}

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

  const { amountCents, dueDate, notes } = parsed.data

  try {
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: generateInvoiceNumber(),
        repairId: id,
        amountCents,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        notes: notes || undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'CREATE_INVOICE',
        entityType: 'Repair',
        entityId: id,
        metadata: { invoiceId: invoice.id, amountCents },
      },
    })

    return NextResponse.json(
      { success: true, invoice },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2003') {
      return NextResponse.json({ error: 'Repair not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to create invoice.' }, { status: 500 })
  }
}
