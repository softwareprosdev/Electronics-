import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const transactionTypes = [
  'PURCHASE',
  'RECEIVE',
  'ALLOCATE',
  'USE',
  'RETURN',
  'ADJUSTMENT',
  'SCRAP',
  'TRANSFER',
] as const

// Types that add to on-hand quantity vs. remove from it. The caller sends a
// positive count; the sign applied to quantityOnHand depends on the type.
const INCREASING_TYPES = new Set<(typeof transactionTypes)[number]>(['PURCHASE', 'RECEIVE', 'RETURN'])

const createSchema = z.object({
  type: z.enum(transactionTypes),
  quantity: z.number().int().min(1).max(1_000_000),
  repairId: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(1000).optional().or(z.literal('')),
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
    return NextResponse.json({ error: 'A valid type and quantity are required.' }, { status: 400 })
  }

  const { type, quantity, repairId, notes } = parsed.data
  const signedQuantity = INCREASING_TYPES.has(type) ? quantity : -quantity

  try {
    const result = await prisma.$transaction(async (tx) => {
      const item = await tx.inventoryItem.findUnique({ where: { id } })
      if (!item) {
        throw new Error('NOT_FOUND')
      }

      const nextQuantity = item.quantityOnHand + signedQuantity
      if (nextQuantity < 0) {
        throw new Error('INSUFFICIENT_STOCK')
      }

      const transaction = await tx.inventoryTransaction.create({
        data: {
          itemId: id,
          type,
          quantity: signedQuantity,
          repairId: repairId || undefined,
          notes: notes || undefined,
          createdById: session.sub,
        },
      })

      const updatedItem = await tx.inventoryItem.update({
        where: { id },
        data: { quantityOnHand: nextQuantity },
      })

      return { transaction, item: updatedItem }
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'CREATE_INVENTORY_TRANSACTION',
        entityType: 'InventoryItem',
        entityId: id,
        metadata: { type, quantity: signedQuantity, repairId },
      },
    })

    return NextResponse.json(
      { success: true, ...result },
      { status: 201, headers: { 'Cache-Control': 'no-store' } },
    )
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Inventory item not found.' }, { status: 404 })
    }
    if (error instanceof Error && error.message === 'INSUFFICIENT_STOCK') {
      return NextResponse.json({ error: 'Not enough stock on hand for this transaction.' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to record transaction.' }, { status: 500 })
  }
}
