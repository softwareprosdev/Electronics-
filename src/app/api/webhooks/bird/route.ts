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

// Never auto-reply to our own domain. Form notifications are sent from
// noreply@ to info@/repairs@, which would otherwise trigger an
// acknowledgment back at ourselves — and because every hop between two
// monitored mailboxes creates a NEW thread, the per-thread guard below
// would not stop that from running away.
const OWN_DOMAIN = siteConfig.email.split('@')[1]?.toLowerCase()

// Classic vacation-autoresponder protection: at most one automated reply to
// the same address per day, whatever thread it arrives on. This is the
// backstop that breaks a loop with an external autoresponder whose subject
// line doesn't match SKIP_SUBJECT_PATTERNS.
const ACK_THROTTLE_HOURS = 24

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

  // Bird's "Send test event" button delivers a synthetic event with no data
  // payload, so this cannot assume the fields are present.
  const data = event.data as
    | {
        message_id?: string
        thread_id?: string
        mailbox_id?: string
        from?: string
        subject?: string | null
      }
    | undefined

  if (!data?.message_id || !data.thread_id || !data.mailbox_id || !data.from) {
    console.log('[bird-webhook] event has no usable message data (synthetic test event?); ignoring.')
    return NextResponse.json({ received: true, skipped: 'no-message-data' })
  }

  const { message_id, thread_id, mailbox_id, from, subject } = data

  if (subject && SKIP_SUBJECT_PATTERNS.some((pattern) => pattern.test(subject))) {
    console.log(`[bird-webhook] skipping likely automated mail: "${subject}"`)
    return NextResponse.json({ received: true, skipped: 'automated-subject' })
  }

  // Match the root domain and any subdomain of it. Bird relays our own
  // outbound mail with a bounce-style envelope-from on send.<domain>, and
  // `from` here is the envelope address, so a plain "@<domain>" check would
  // miss our own notification mail entirely.
  const senderDomain = from.toLowerCase().split('@').pop() ?? ''
  const isOwnDomain =
    !!OWN_DOMAIN && (senderDomain === OWN_DOMAIN || senderDomain.endsWith(`.${OWN_DOMAIN}`))

  if (isOwnDomain) {
    console.log(`[bird-webhook] skipping mail from our own domain: ${from}`)
    return NextResponse.json({ received: true, skipped: 'own-domain' })
  }

  const throttleCutoff = new Date(Date.now() - ACK_THROTTLE_HOURS * 60 * 60 * 1000)
  const recentAckToSender = await prisma.inboundEmailAck.findFirst({
    where: { fromAddress: from, repliedAt: { gte: throttleCutoff } },
  })

  if (recentAckToSender) {
    console.log(`[bird-webhook] ${from} already acknowledged within ${ACK_THROTTLE_HOURS}h, skipping.`)
    return NextResponse.json({ received: true, skipped: 'sender-throttled' })
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

  const reply = await replyInThread({
    threadId: thread_id,
    messageId: message_id,
    text: ACK_TEXT,
  })

  if (!reply.ok) {
    // The row above doubles as a lock against duplicate deliveries, so it has
    // to come out again when the send fails — otherwise the thread stays
    // marked acknowledged forever and the customer never gets a reply.
    await prisma.inboundEmailAck.delete({ where: { threadId: thread_id } }).catch(() => {})

    if (reply.permanent) {
      // Retrying a missing scope or bad credential just fails again on every
      // attempt and gets the endpoint marked degraded, so acknowledge the
      // delivery and rely on the logged error instead.
      console.error(
        `[bird-webhook] reply permanently failed for thread=${thread_id}; not requesting retry. Check the Bird API key's scopes.`,
      )
      return NextResponse.json({ received: true, skipped: 'reply-failed-permanent' })
    }

    console.error(`[bird-webhook] reply failed for thread=${thread_id}; requesting retry.`)
    return NextResponse.json({ error: 'Reply failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
