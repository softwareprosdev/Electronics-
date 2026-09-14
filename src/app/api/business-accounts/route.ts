import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { businessAccountSchema } from '@/lib/validation'
import { getClientKey, rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/notify'
import { siteConfig } from '@/lib/site-config'
import { isTrustedOrigin } from '@/lib/csrf'

const MAX_REQUEST_BODY_BYTES = 32 * 1024

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_REQUEST_BODY_BYTES) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413 })
  }

  const clientKey = getClientKey(request)
  const limit = await rateLimit(`business-account:${clientKey}`, { limit: 5, windowMs: 10 * 60_000 })
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
    const existing = await prisma.businessAccount.findUnique({ where: { email } })

    // This is a public, unauthenticated endpoint. Once an account has been
    // approved by staff, a resubmission using the same email must not be
    // able to silently overwrite its data — that would let anyone who
    // learns a partner's email tamper with their business profile. Only
    // create new applications or update ones still pending review.
    if (existing?.isApproved) {
      await sendEmail({
        to: siteConfig.email,
        subject: `Duplicate trade account submission: ${shopName}`,
        body: `A new submission was received for an already-approved account (${email}). No changes were made to the existing record.`,
      })
      return NextResponse.json({ success: true }, { status: 200 })
    }

    await prisma.businessAccount.upsert({
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

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Failed to save business account request', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
