import { NextResponse } from 'next/server'
import { BirdClient, BirdWebhookVerificationError } from '@messagebird/sdk'
import { prisma } from '@/lib/prisma'
import { replyInThread } from '@/lib/mailbox'
import { siteConfig } from '@/lib/site-config'

// Bird delivers this on every mailbox event we're subscribed to; we only act
// on inbound customer mail. Subject-line patterns for mail that should never
// receive an automated reply (bounces, out-of-office, delivery failures) —
// replying to these is the classic way autoresponders end up in a loop with
// another automated system.
const SKIP_SUBJECT_PATTERNS = [
  /out of office/i,
  /automatic reply/i,
  /auto-reply/i,
  /autoreply/i,
  /undeliverable/i,
  /undelivered/i,
  /delivery status notification/i,
  /mail delivery failed/i,
  /returned mail/i,
]

const ACK_TEXT = `Thanks for reaching out to ${siteConfig.name}. This confirms we received your message, and a technician will follow up shortly. If this is time-sensitive, you can reach us directly at ${siteConfig.phoneDisplay}.`

export async function POST(request: Request) {
  const rawBody = await request.text()
  const apiKey = process.env.EMAIL_API_KEY
  const webhookSecret = process.env.BIRD_WEBHOOK_SECRET

  if (!apiKey || !webhookSecret) {
    console.error('[bird-webhook] EMAIL_API_KEY or BIRD_WEBHOOK_SECRET is not set.')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const bird = new BirdClient({ apiKey, webhooks: { secret: webhookSecret } })

  let event
  try {
    event = bird.webhooks.unwrap(rawBody, request.headers)
  } catch (error) {
    if (error instanceof BirdWebhookVerificationError) {
      console.warn('[bird-webhook] signature verification failed', error.message)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    throw error
  }

  if (event.type !== 'email_mailbox.message_received') {
    // We only subscribed to this one event type, but unknown/future event
    // types are returned as-is by unwrap() rather than throwing, so this is
    // a normal no-op path, not an error.
    return NextResponse.json({ received: true })
  }

  const { message_id, thread_id, mailbox_id, from, subject } = event.data

  if (subject && SKIP_SUBJECT_PATTERNS.some((pattern) => pattern.test(subject))) {
    console.log(`[bird-webhook] skipping likely automated mail: "${subject}"`)
    return NextResponse.json({ received: true, skipped: 'automated-subject' })
  }

  const alreadyAcknowledged = await prisma.inboundEmailAck.findUnique({
    where: { threadId: thread_id },
  })

  if (alreadyAcknowledged) {
    console.log(`[bird-webhook] thread=${thread_id} already acknowledged, skipping reply.`)
    return NextResponse.json({ received: true, skipped: 'already-acknowledged' })
  }

  try {
    // The unique constraint on threadId is the real loop-prevention
    // mechanism: at most one acknowledgment per conversation. This create()
    // can still race with a near-simultaneous duplicate webhook delivery
    // that passed the findUnique check above at the same instant.
    await prisma.inboundEmailAck.create({
      data: {
        threadId: thread_id,
        mailboxId: mailbox_id,
        messageId: message_id,
        fromAddress: from,
        subject: subject ?? undefined,
      },
    })
  } catch (error) {
    console.log(`[bird-webhook] thread=${thread_id} create raced with another delivery, skipping reply.`)
    return NextResponse.json({ received: true, skipped: 'already-acknowledged' })
  }

  await replyInThread({ threadId: thread_id, messageId: message_id, text: ACK_TEXT })

  return NextResponse.json({ received: true })
}
