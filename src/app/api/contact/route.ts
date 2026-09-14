import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { contactSubmissionSchema } from '@/lib/validation'
import { getClientKey, rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/notify'
import { siteConfig } from '@/lib/site-config'

export async function POST(request: Request) {
  const clientKey = getClientKey(request)
  const limit = rateLimit(`contact:${clientKey}`, { limit: 8, windowMs: 10 * 60_000 })
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

  const parsed = contactSubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  if (parsed.data.website) {
    return NextResponse.json({ success: true })
  }

  const { name, email, phone, message, type } = parsed.data

  try {
    await prisma.contactSubmission.create({
      data: { name, email, phone: phone || undefined, message, type },
    })

    await sendEmail({
      to: siteConfig.email,
      subject: `New ${type.replace('_', ' ').toLowerCase()} contact submission`,
      body: `From ${name} (${email}): ${message}`,
    })

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Failed to save contact submission', error)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 },
    )
  }
}
