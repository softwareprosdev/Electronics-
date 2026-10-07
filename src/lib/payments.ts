// Payment provider abstraction — mirrors the pattern in notify.ts
// (EMAIL_PROVIDER/sendEmail). PAYMENT_PROVIDER selects the implementation;
// only "stripe" exists today, but nothing here hard-codes Stripe as the
// only possible provider — a Square/other implementation would branch the
// same way sendViaBird() sits alongside a future sendViaSes().

import Stripe from 'stripe'

export interface CheckoutSessionResult {
  url: string
  sessionId: string
}

function getStripeClient(): Stripe {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not set.')
  }
  return new Stripe(secretKey)
}

export interface StoreCartLine {
  inventoryItemId: string
  quantity: number
  unitPriceCents: number
  name: string
}

export async function createStoreCheckoutSession(options: {
  lines: StoreCartLine[]
  successUrl: string
  cancelUrl: string
}): Promise<CheckoutSessionResult> {
  const provider = process.env.PAYMENT_PROVIDER || 'stripe'
  if (provider !== 'stripe') {
    throw new Error(`Payment provider "${provider}" is not implemented.`)
  }

  const stripe = getStripeClient()

  // The cart (item id, quantity, and the price actually charged) travels in
  // metadata so the webhook can create the Order + decrement inventory
  // without re-trusting anything the browser sent at checkout time — only
  // this server-constructed value, carried through Stripe, is authoritative.
  const cartMetadata = JSON.stringify(
    options.lines.map((line) => ({ id: line.inventoryItemId, q: line.quantity, p: line.unitPriceCents })),
  )

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    shipping_address_collection: { allowed_countries: ['US'] },
    line_items: options.lines.map((line) => ({
      price_data: {
        currency: 'usd',
        unit_amount: line.unitPriceCents,
        product_data: { name: line.name },
      },
      quantity: line.quantity,
    })),
    metadata: { cart: cartMetadata },
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
  })

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL.')
  }

  return { url: session.url, sessionId: session.id }
}

export async function createInvoiceCheckoutSession(options: {
  invoiceId: string
  invoiceNumber: string
  amountCents: number
  customerEmail: string
  successUrl: string
  cancelUrl: string
}): Promise<CheckoutSessionResult> {
  const provider = process.env.PAYMENT_PROVIDER || 'stripe'

  if (provider !== 'stripe') {
    throw new Error(`Payment provider "${provider}" is not implemented.`)
  }

  const stripe = getStripeClient()

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: options.customerEmail,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: options.amountCents,
          product_data: {
            name: `Invoice ${options.invoiceNumber}`,
            description: 'TraceWorks Lab repair invoice',
          },
        },
        quantity: 1,
      },
    ],
    metadata: { invoiceId: options.invoiceId },
    success_url: options.successUrl,
    cancel_url: options.cancelUrl,
  })

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL.')
  }

  return { url: session.url, sessionId: session.id }
}
