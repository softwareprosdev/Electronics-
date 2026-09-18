import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { prisma } from '@/lib/prisma'
import { repairRequestSchema } from '@/lib/validation'
import { getClientKey, rateLimit } from '@/lib/rate-limit'
import { sendEmail } from '@/lib/notify'
import { siteConfig } from '@/lib/site-config'
import { AttachmentValidationError, storeAttachment } from '@/lib/storage'
import { isTrustedOrigin } from '@/lib/csrf'

const MAX_REQUEST_BODY_BYTES = 24 * 1024 * 1024 // 24MB — leaves headroom under typical platform limits

function generateReferenceCode(): string {
  return `REP-${randomUUID().slice(0, 8).toUpperCase()}`
}

function attachmentKindFromMime(mimeType: string): 'PHOTO' | 'VIDEO' | 'DOCUMENT' {
  if (mimeType.startsWith('image/')) return 'PHOTO'
  if (mimeType.startsWith('video/')) return 'VIDEO'
  return 'DOCUMENT'
}

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const contentLength = Number(request.headers.get('content-length') || 0)
  if (contentLength > MAX_REQUEST_BODY_BYTES) {
    return NextResponse.json({ error: 'Request is too large.' }, { status: 413 })
  }

  const clientKey = getClientKey(request)
  const limit = await rateLimit(`repair-request:${clientKey}`, { limit: 5, windowMs: 10 * 60_000 })
  if (!limit.success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again shortly.' },
      { status: 429 },
    )
  }

  const contentType = request.headers.get('content-type') || ''
  let fields: Record<string, unknown> = {}
  const files: File[] = []

  try {
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          if (value.size > 0) files.push(value)
        } else if (key === 'hasLiquidDamage' || key === 'hasPhysicalDamage' || key === 'hasPowerIssue' || key === 'isIntermittent' || key === 'hasNoDisplay' || key === 'hasBootFailure') {
          fields[key] = value === 'true' || value === 'on'
        } else {
          fields[key] = value
        }
      }
    } else {
      fields = await request.json()
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 })
  }

  const parsed = repairRequestSchema.safeParse(fields)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed.', issues: parsed.error.flatten() },
      { status: 400 },
    )
  }

  // Honeypot: silently accept but do nothing.
  if (parsed.data.website) {
    return NextResponse.json({ success: true, referenceCode: generateReferenceCode() })
  }

  if (files.length > 6) {
    return NextResponse.json({ error: 'A maximum of 6 files may be uploaded.' }, { status: 400 })
  }

  const data = parsed.data

  try {
    const customer = await prisma.customer.upsert({
      where: { email: data.email },
      update: { name: data.name, phone: data.phone, company: data.company || undefined },
      create: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company || undefined,
      },
    })

    const device = await prisma.device.create({
      data: {
        category: data.category,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber || undefined,
        partNumber: data.partNumber || undefined,
      },
    })

    const referenceCode = generateReferenceCode()

    const repair = await prisma.repair.create({
      data: {
        referenceCode,
        status: 'NEW',
        servicePreference: data.servicePreference,
        customerId: customer.id,
        deviceId: device.id,
        errorCode: data.errorCode || undefined,
        symptoms: data.symptoms,
        problemStartedAt: data.problemStartedAt || undefined,
        previousAttempts: data.previousAttempts || undefined,
        hasLiquidDamage: data.hasLiquidDamage,
        hasPhysicalDamage: data.hasPhysicalDamage,
        hasPowerIssue: data.hasPowerIssue,
        isIntermittent: data.isIntermittent,
        hasNoDisplay: data.hasNoDisplay,
        hasBootFailure: data.hasBootFailure,
        statusHistory: {
          create: { status: 'NEW', note: 'Repair request submitted via website.' },
        },
      },
    })

    for (const file of files) {
      try {
        const stored = await storeAttachment(file, repair.id)
        await prisma.attachment.create({
          data: {
            repairId: repair.id,
            kind: attachmentKindFromMime(stored.mimeType),
            storageKey: stored.storageKey,
            fileName: stored.fileName,
            mimeType: stored.mimeType,
            sizeBytes: stored.sizeBytes,
            uploadedBy: 'customer',
          },
        })
      } catch (error) {
        // Skip a failed attachment (invalid file, or a storage backend
        // issue) rather than failing the whole submission — the repair
        // request record itself is already valid and must not be lost.
        if (!(error instanceof AttachmentValidationError)) {
          console.error('Failed to store attachment for repair', repair.id, error)
        }
      }
    }

    await sendEmail({
      to: siteConfig.repairEmail,
      subject: `New repair request ${referenceCode}`,
      body: `New repair request from ${data.name} (${data.email}). Category: ${data.category}. Symptoms: ${data.symptoms}`,
    })

    await sendEmail({
      to: data.email,
      subject: `Request Received — ${referenceCode}`,
      body: 'A technician will review the information and determine the appropriate diagnostic path.',
    })

    return NextResponse.json({ success: true, referenceCode }, { status: 201 })
  } catch (error) {
    console.error('Failed to create repair request', error)
    return NextResponse.json(
      { error: 'Something went wrong while submitting your request. Please try again.' },
      { status: 500 },
    )
  }
}

export const runtime = 'nodejs'
