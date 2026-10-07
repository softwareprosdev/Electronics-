import { randomBytes } from 'node:crypto'
import type Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

interface CartLine {
  id: string
  q: number
  p: number
}

function generateOrderNumber(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const suffix = randomBytes(2).toString('hex').toUpperCase()
  return `ORD-${date}-${suffix}`
}

// Called from the Stripe webhook on checkout.session.completed for a store
// cart (identified by metadata.cart, as opposed to metadata.invoiceId for
// an invoice payment). Idempotent on stripeSessionId — Stripe retries
// webhook delivery on anything but a fast 2xx, so this must tolerate the
// same session arriving twice.
export async function fulfillStoreOrder(session: Stripe.Checkout.Session): Promise<void> {
  const existing = await prisma.order.findUnique({ where: { stripeSessionId: session.id } })
  if (existing) {
    console.log(`[store-orders] order for session=${session.id} already fulfilled; skipping.`)
    return
  }

  const cartRaw = session.metadata?.cart
  if (!cartRaw) {
    throw new Error('NO_CART_METADATA')
  }

  const cart = JSON.parse(cartRaw) as CartLine[]
  const customerDetails = session.customer_details
  const shippingDetails = session.collected_information?.shipping_details
  const address = shippingDetails?.address

  if (!customerDetails?.email || !address?.line1 || !address.city || !address.state || !address.postal_code) {
    throw new Error('MISSING_CUSTOMER_OR_SHIPPING_DETAILS')
  }

  // Re-bind as fresh consts so the null checks above actually narrow these
  // for TypeScript inside the transaction closure below — narrowing on the
  // original Stripe-typed fields doesn't carry across the async boundary.
  const email = customerDetails.email
  const name = customerDetails.name || shippingDetails?.name || email
  const line1 = address.line1
  const line2 = address.line2
  const city = address.city
  const state = address.state
  const postalCode = address.postal_code
  const country = address.country

  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        status: 'PAID',
        customerName: name,
        customerEmail: email,
        shippingLine1: line1,
        shippingLine2: line2 || undefined,
        shippingCity: city,
        shippingState: state,
        shippingZip: postalCode,
        shippingCountry: country || 'US',
        amountCents: session.amount_total ?? cart.reduce((sum, line) => sum + line.p * line.q, 0),
        stripeSessionId: session.id,
      },
    })

    for (const line of cart) {
      await tx.orderItem.create({
        data: {
          orderId: order.id,
          inventoryItemId: line.id,
          quantity: line.q,
          unitPriceCents: line.p,
        },
      })

      const item = await tx.inventoryItem.findUnique({ where: { id: line.id } })
      if (!item) continue

      await tx.inventoryTransaction.create({
        data: {
          itemId: line.id,
          type: 'SALE',
          quantity: -line.q,
          orderId: order.id,
          notes: `Sold via ${order.orderNumber}`,
        },
      })

      // A sale that outpaces stock (a race with another near-simultaneous
      // checkout) still gets fulfilled — the customer already paid — but
      // never silently reported as having stock it doesn't.
      await tx.inventoryItem.update({
        where: { id: line.id },
        data: { quantityOnHand: Math.max(0, item.quantityOnHand - line.q) },
      })
    }
  })

  console.log(`[store-orders] fulfilled order for session=${session.id}`)
}
