import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const createSchema = z.object({
  sku: z.string().trim().min(1).max(100),
  description: z.string().trim().min(1).max(500),
  manufacturer: z.string().trim().max(200).optional().or(z.literal('')),
  partNumber: z.string().trim().max(200).optional().or(z.literal('')),
  category: z.string().trim().max(100).optional().or(z.literal('')),
  costCents: z.number().int().min(0).max(100_000_00),
  sellingPriceCents: z.number().int().min(0).max(100_000_00).nullable().optional(),
  quantityOnHand: z.number().int().min(0).max(1_000_000),
  minimumQuantity: z.number().int().min(0).max(1_000_000),
  location: z.string().trim().max(200).optional().or(z.literal('')),
})

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Validation failed.', details: parsed.error.flatten() }, { status: 400 })
  }

  const data = parsed.data

  try {
    const item = await prisma.inventoryItem.create({
      data: {
        sku: data.sku,
        description: data.description,
        manufacturer: data.manufacturer || undefined,
        partNumber: data.partNumber || undefined,
        category: data.category || undefined,
        costCents: data.costCents,
        sellingPriceCents: data.sellingPriceCents ?? undefined,
        quantityOnHand: data.quantityOnHand,
        minimumQuantity: data.minimumQuantity,
        location: data.location || undefined,
        transactions:
          data.quantityOnHand > 0
            ? {
                create: {
                  type: 'RECEIVE',
                  quantity: data.quantityOnHand,
                  notes: 'Initial stock on item creation',
                  createdById: session.sub,
                },
              }
            : undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'CREATE_INVENTORY_ITEM',
        entityType: 'InventoryItem',
        entityId: item.id,
      },
    })

    return NextResponse.json(
      { success: true, item },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2002') {
      return NextResponse.json({ error: 'An item with that SKU already exists.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create item.' }, { status: 500 })
  }
}
