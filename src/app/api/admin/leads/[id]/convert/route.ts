import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAdminSession } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const session = await getAdminSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  const { id } = await params

  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) {
    return NextResponse.json({ error: 'Lead not found.' }, { status: 404 })
  }
  if (lead.convertedCustomerId) {
    return NextResponse.json({ error: 'This lead has already been converted.' }, { status: 409 })
  }

  try {
    // Reuse an existing customer by email if one already exists (e.g. a
    // returning customer submitting a new inquiry) rather than creating a
    // duplicate record.
    const customer = await prisma.customer.upsert({
      where: { email: lead.email },
      update: {},
      create: {
        name: lead.name,
        email: lead.email,
        phone: lead.phone || undefined,
        company: lead.company || undefined,
      },
    })

    const updated = await prisma.lead.update({
      where: { id: lead.id },
      data: { convertedCustomerId: customer.id, status: 'CONVERTED' },
    })

    await prisma.auditLog.create({
      data: {
        actorId: session.sub,
        action: 'CONVERT_LEAD',
        entityType: 'Lead',
        entityId: lead.id,
        metadata: { customerId: customer.id },
      },
    })

    return NextResponse.json(
      { success: true, lead: updated, customer },
      { headers: { 'Cache-Control': 'no-store' } },
    )
  } catch {
    return NextResponse.json({ error: 'Failed to convert lead.' }, { status: 500 })
  }
}
