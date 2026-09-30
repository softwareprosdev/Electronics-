import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'
import { recordInvoicePayment } from '@/lib/invoicing'

const createSchema = z.object({
  amountCents: z.number().int().min(1).max(100_000_00),
  method: z.enum(['CASH', 'CHECK', 'CARD', 'OTHER']),
  transactionReference: z.string().trim().max(200).optional().or(z.literal('')),
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
    return NextResponse.json({ error: 'A valid payment amount and method are required.' }, { status: 400 })
  }

  const { amountCents, method, transactionReference } = parsed.data

  try {
    const result = await recordInvoicePayment({
      invoiceId: id,
      amountCents,
      method,
      transactionReference,
      recordedById: session.sub,
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'RECORD_PAYMENT',
        entityType: 'Invoice',
        entityId: id,
        metadata: { paymentId: result.payment.id, amountCents, method },
      },
    })

    return NextResponse.json(
      { success: true, payment: result.payment, invoice: result.invoice },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'INVOICE_NOT_FOUND') {
      return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 })
  }
}
