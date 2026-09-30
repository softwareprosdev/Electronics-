import { prisma } from '@/lib/prisma'

export interface RecordPaymentOptions {
  invoiceId: string
  amountCents: number
  method: 'CASH' | 'CHECK' | 'CARD' | 'OTHER'
  transactionReference?: string
  recordedById?: string
}

// Shared by the manual "record a payment taken elsewhere" admin route and
// the Stripe webhook (a real card payment collected online) — both need the
// exact same invariant: quantityOnHand-style derived status recomputed
// inside a transaction so concurrent payments can't race into an
// inconsistent PARTIALLY_PAID/PAID state.
export async function recordInvoicePayment(options: RecordPaymentOptions) {
  const { invoiceId, amountCents, method, transactionReference, recordedById } = options

  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  })
  if (!invoice) {
    throw new Error('INVOICE_NOT_FOUND')
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        invoiceId,
        amountCents,
        method,
        transactionReference: transactionReference || undefined,
        recordedById: recordedById || undefined,
      },
    })

    const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountCents, 0) + amountCents
    const nextStatus =
      totalPaid >= invoice.amountCents ? 'PAID' : totalPaid > 0 ? 'PARTIALLY_PAID' : invoice.status

    const updatedInvoice = await tx.invoice.update({
      where: { id: invoiceId },
      data: { status: nextStatus },
      include: { payments: { orderBy: { paidAt: 'desc' } } },
    })

    return { payment, invoice: updatedInvoice }
  })
}
