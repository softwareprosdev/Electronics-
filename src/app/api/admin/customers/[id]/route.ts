import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

const updateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  email: z.string().trim().email().max(200).optional(),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  company: z.string().trim().max(200).optional().or(z.literal('')),
  addressLine1: z.string().trim().max(200).optional().or(z.literal('')),
  addressLine2: z.string().trim().max(200).optional().or(z.literal('')),
  city: z.string().trim().max(100).optional().or(z.literal('')),
  state: z.string().trim().max(50).optional().or(z.literal('')),
  zip: z.string().trim().max(20).optional().or(z.literal('')),
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

  try {
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone !== undefined ? data.phone || null : undefined,
        company: data.company !== undefined ? data.company || null : undefined,
        addressLine1: data.addressLine1 !== undefined ? data.addressLine1 || null : undefined,
        addressLine2: data.addressLine2 !== undefined ? data.addressLine2 || null : undefined,
        city: data.city !== undefined ? data.city || null : undefined,
        state: data.state !== undefined ? data.state || null : undefined,
        zip: data.zip !== undefined ? data.zip || null : undefined,
      },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'UPDATE_CUSTOMER',
        entityType: 'Customer',
        entityId: customer.id,
      },
    })

    return NextResponse.json({ success: true, customer }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2002') {
      return NextResponse.json({ error: 'A customer with that email already exists.' }, { status: 409 })
    }
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update customer.' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await params

  try {
    await prisma.customer.delete({ where: { id } })

    await prisma.auditLog.create({
      data: { actorId: session.sub, action: 'DELETE_CUSTOMER', entityType: 'Customer', entityId: id },
    })

    return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    const code = (error as { code?: string })?.code
    if (code === 'P2003') {
      return NextResponse.json(
        { error: 'This customer has repair records and cannot be deleted.' },
        { status: 409 },
      )
    }
    if (code === 'P2025') {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to delete customer.' }, { status: 500 })
  }
}
