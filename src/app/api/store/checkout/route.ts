import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { createStoreCheckoutSession } from '@/lib/payments'
import { siteConfig } from '@/lib/site-config'
import { isTrustedOrigin } from '@/lib/csrf'
import { getClientKey, rateLimit } from '@/lib/rate-limit'

export const runtime = 'nodejs'

const MAX_DISTINCT_ITEMS = 10
const MAX_QUANTITY_PER_ITEM = 50

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        inventoryItemId: z.string().trim().min(1),
        quantity: z.number().int().min(1).max(MAX_QUANTITY_PER_ITEM),
      }),
    )
    .min(1)
    .max(MAX_DISTINCT_ITEMS),
})

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const clientKey = getClientKey(request)
  const limit = await rateLimit(`store-checkout:${clientKey}`, { limit: 10, windowMs: 10 * 60_000 })
  if (!limit.success) {
    return NextResponse.json({ error: 'Too many requests. Please try again shortly.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Your cart looks invalid. Please refresh and try again.' }, { status: 400 })
  }

  const ids = parsed.data.items.map((i) => i.inventoryItemId)
  const dbItems = await prisma.inventoryItem.findMany({
    where: { id: { in: ids }, isForSale: true },
  })
  const dbItemsById = new Map(dbItems.map((item) => [item.id, item]))

  const lines = []
  for (const requested of parsed.data.items) {
    const item = dbItemsById.get(requested.inventoryItemId)
    if (!item) {
      return NextResponse.json(
        { error: 'One of the items in your cart is no longer available.' },
        { status: 409 },
      )
    }
    if (item.quantityOnHand < requested.quantity) {
      return NextResponse.json(
        { error: `Only ${item.quantityOnHand} of "${item.publicName || item.description}" left in stock.` },
        { status: 409 },
      )
    }
    if (!item.sellingPriceCents) {
      return NextResponse.json(
        { error: `"${item.publicName || item.description}" doesn't have a price set yet.` },
        { status: 409 },
      )
    }
    lines.push({
      inventoryItemId: item.id,
      quantity: requested.quantity,
      unitPriceCents: item.sellingPriceCents,
      name: item.publicName || item.description,
    })
  }

  try {
    const checkout = await createStoreCheckoutSession({
      lines,
      successUrl: `${siteConfig.url}/store/order-confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${siteConfig.url}/cart`,
    })

    return NextResponse.json({ success: true, url: checkout.url })
  } catch (error) {
    console.error('[store-checkout] failed to create checkout session', error)
    const message = error instanceof Error ? error.message : 'Failed to start checkout.'
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
