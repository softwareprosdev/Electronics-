import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

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

  const invoice = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } })
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
  }

  const { amountCents, method, transactionReference } = parsed.data

  try {
    const [payment] = await prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          invoiceId: id,
          amountCents,
          method,
          transactionReference: transactionReference || undefined,
          recordedById: session.sub,
        },
      })

      const totalPaid =
        invoice.payments.reduce((sum, p) => sum + p.amountCents, 0) + amountCents
      const nextStatus =
        totalPaid >= invoice.amountCents
          ? 'PAID'
          : totalPaid > 0
            ? 'PARTIALLY_PAID'
            : invoice.status

      await tx.invoice.update({ where: { id }, data: { status: nextStatus } })

      return [created]
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'RECORD_PAYMENT',
        entityType: 'Invoice',
        entityId: id,
        metadata: { paymentId: payment.id, amountCents, method },
      },
    })

    const updatedInvoice = await prisma.invoice.findUnique({
      where: { id },
      include: { payments: { orderBy: { paidAt: 'desc' } } },
    })

    return NextResponse.json(
      { success: true, payment, invoice: updatedInvoice },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json({ error: 'Failed to record payment.' }, { status: 500 })
  }
}
