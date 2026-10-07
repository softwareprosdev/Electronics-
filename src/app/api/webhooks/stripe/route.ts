import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'
import { recordInvoicePayment } from '@/lib/invoicing'
import { fulfillStoreOrder } from '@/lib/store-orders'

export const runtime = 'nodejs'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const secretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const signature = request.headers.get('stripe-signature')

  if (!secretKey || !webhookSecret) {
    console.error('[stripe-webhook] STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET is not set.')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  const stripe = new Stripe(secretKey)

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (error) {
    console.warn('[stripe-webhook] signature verification failed', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (event.type !== 'checkout.session.completed') {
    return NextResponse.json({ received: true })
  }

  const checkoutSession = event.data.object as Stripe.Checkout.Session
  const invoiceId = checkoutSession.metadata?.invoiceId
  const isStoreOrder = !!checkoutSession.metadata?.cart

  if (!invoiceId && !isStoreOrder) {
    console.warn('[stripe-webhook] checkout.session.completed with no invoiceId or cart in metadata; ignoring.')
    return NextResponse.json({ received: true, skipped: 'no-metadata' })
  }

  if (checkoutSession.payment_status !== 'paid') {
    console.log(`[stripe-webhook] session ${checkoutSession.id} completed but payment_status is not "paid"; ignoring.`)
    return NextResponse.json({ received: true, skipped: 'not-paid' })
  }

  if (isStoreOrder) {
    try {
      await fulfillStoreOrder(checkoutSession)
    } catch (error) {
      // A malformed/missing cart or shipping details can't be retried into
      // succeeding, so acknowledge rather than let Stripe hammer this
      // endpoint forever on a permanently-bad payload.
      if (error instanceof Error && (error.message === 'NO_CART_METADATA' || error.message === 'MISSING_CUSTOMER_OR_SHIPPING_DETAILS')) {
        console.error(`[stripe-webhook] store order for session=${checkoutSession.id} failed permanently: ${error.message}`)
        return NextResponse.json({ received: true, skipped: error.message })
      }
      console.error('[stripe-webhook] failed to fulfill store order', error)
      return NextResponse.json({ error: 'Failed to fulfill order' }, { status: 500 })
    }
    return NextResponse.json({ received: true })
  }

  if (!invoiceId) {
    // Unreachable given the guard above (isStoreOrder is false here, so the
    // earlier check guarantees invoiceId is set) — satisfies the type
    // checker without an assertion.
    return NextResponse.json({ received: true, skipped: 'no-invoice-id' })
  }

  const amountCents = checkoutSession.amount_total
  if (!amountCents) {
    console.warn(`[stripe-webhook] session ${checkoutSession.id} has no amount_total; ignoring.`)
    return NextResponse.json({ received: true, skipped: 'no-amount' })
  }

  const paymentIntentId =
    typeof checkoutSession.payment_intent === 'string'
      ? checkoutSession.payment_intent
      : checkoutSession.payment_intent?.id

  // Stripe retries webhook delivery on anything but a fast 2xx, so the same
  // checkout.session.completed event can arrive more than once — this is
  // the idempotency guard against double-recording the same payment.
  if (paymentIntentId) {
    const existing = await prisma.payment.findFirst({ where: { transactionReference: paymentIntentId } })
    if (existing) {
      console.log(`[stripe-webhook] payment for intent=${paymentIntentId} already recorded; skipping.`)
      return NextResponse.json({ received: true, skipped: 'already-recorded' })
    }
  }

  try {
    await recordInvoicePayment({
      invoiceId,
      amountCents,
      method: 'CARD',
      transactionReference: paymentIntentId,
    })
    console.log(`[stripe-webhook] recorded payment for invoice=${invoiceId} session=${checkoutSession.id}`)
  } catch (error) {
    if (error instanceof Error && error.message === 'INVOICE_NOT_FOUND') {
      console.error(`[stripe-webhook] invoice ${invoiceId} not found for session ${checkoutSession.id}`)
      return NextResponse.json({ received: true, skipped: 'invoice-not-found' })
    }
    // A real transient failure here (DB blip) should be retried by Stripe,
    // so this is the one case that returns 500 rather than a 200 no-op.
    console.error('[stripe-webhook] failed to record payment', error)
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
