import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'
import { createInvoiceCheckoutSession } from '@/lib/payments'
import { siteConfig } from '@/lib/site-config'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await params

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: { payments: true, repair: { include: { customer: true } } },
  })
  if (!invoice) {
    return NextResponse.json({ error: 'Invoice not found.' }, { status: 404 })
  }

  const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amountCents, 0)
  const balanceDue = invoice.amountCents - totalPaid
  if (balanceDue <= 0) {
    return NextResponse.json({ error: 'This invoice has no balance due.' }, { status: 409 })
  }

  try {
    const checkout = await createInvoiceCheckoutSession({
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      amountCents: balanceDue,
      customerEmail: invoice.repair.customer.email,
      successUrl: `${siteConfig.url}/admin/invoices/${invoice.id}/print?paid=1`,
      cancelUrl: `${siteConfig.url}/admin/repairs/${invoice.repair.id}`,
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'CREATE_STRIPE_CHECKOUT',
        entityType: 'Invoice',
        entityId: invoice.id,
        metadata: { sessionId: checkout.sessionId, amountCents: balanceDue },
      },
    })

    return NextResponse.json({ success: true, url: checkout.url })
  } catch (error) {
    console.error('[stripe] checkout session creation failed', error)
    const message = error instanceof Error ? error.message : 'Failed to create checkout session.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
