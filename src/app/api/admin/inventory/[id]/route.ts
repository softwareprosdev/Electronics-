import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const updateSchema = z.object({
  isForSale: z.boolean().optional(),
  slug: z.string().trim().toLowerCase().regex(slugPattern).max(200).nullable().optional(),
  publicName: z.string().trim().max(200).nullable().optional(),
  publicDescription: z.string().trim().max(2000).nullable().optional(),
  imageUrl: z.string().trim().url().max(1000).nullable().optional(),
  sellingPriceCents: z.number().int().min(0).max(100_000_00).nullable().optional(),
})

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
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

  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  if (data.isForSale && !data.slug) {
    // Listing an item for sale with no slug yet would be unreachable at
    // /store/[slug] — require one in the same request rather than let it
    // silently become invisible on the storefront.
    const existing = await prisma.inventoryItem.findUnique({ where: { id }, select: { slug: true } })
    if (!existing?.slug) {
      return NextResponse.json({ error: 'Set a URL slug before listing this item for sale.' }, { status: 400 })
    }
  }

  try {
    const item = await prisma.inventoryItem.update({
      where: { id },
      data: {
        isForSale: data.isForSale,
        slug: data.slug,
        publicName: data.publicName,
        publicDescription: data.publicDescription,
        imageUrl: data.imageUrl,
        sellingPriceCents: data.sellingPriceCents,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'UPDATE_INVENTORY_ITEM',
        entityType: 'InventoryItem',
        entityId: item.id,
      },
    })

    return NextResponse.json({ success: true, item }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2002') {
      return NextResponse.json({ error: 'That slug is already in use by another item.' }, { status: 409 })
    }
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Item not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update item.' }, { status: 500 })
  }
}
