import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { businessAccountSchema } from '@/lib/validation'
import { getClientKey, rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/notify'
import { siteConfig } from '@/lib/site-config'

export async function POST(request: Request) {
  const clientKey = getClientKey(request)
  const limit = rateLimit(`business-account:${clientKey}`, { limit: 5, windowMs: 10 * 60_000 })
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = businessAccountSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  if (parsed.data.website_hp) {
    return NextResponse.json({ success: true })
  }

  const { shopName, contactName, email, phone, website, monthlyVolume, equipmentTypes, outsourcingNeeds, accountType } =
    parsed.data

  try {
    const account = await prisma.businessAccount.upsert({
      where: { email },
      update: {
        shopName,
        contactName,
        phone: phone || undefined,
        website: website || undefined,
        monthlyVolume: monthlyVolume || undefined,
        equipmentTypes: equipmentTypes || undefined,
        outsourcingNeeds: outsourcingNeeds || undefined,
        accountType,
      },
      create: {
        shopName,
        contactName,
        email,
        phone: phone || undefined,
        website: website || undefined,
        monthlyVolume: monthlyVolume || undefined,
        equipmentTypes: equipmentTypes || undefined,
        outsourcingNeeds: outsourcingNeeds || undefined,
        accountType,
      },
    })

    await sendEmail({
      to: siteConfig.email,
      subject: `New trade account request: ${shopName}`,
      body: `Contact: ${contactName} (${email}). Account type: ${accountType}.`,
    })

    return NextResponse.json({ success: true, id: account.id }, { status: 201 })
  } catch (error) {
    console.error('Failed to save business account request', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
