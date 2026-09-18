// Send a message as a specific Bird Mailbox (a shared inbox you manage in
// Bird, e.g. the one behind info@ or repairs@traceworkslab.com) — distinct
// from src/lib/notify.ts's sendEmail(), which sends transactional
// notifications from a generic verified sender via Bird's Email API.

import { BirdClient } from '@messagebird/sdk'

export async function composeFromMailbox(options: {
  to: string[]
  subject: string
  text: string
}) {
  const apiKey = process.env.EMAIL_API_KEY
  const mailboxId = process.env.BIRD_MAILBOX_ID

  if (!apiKey || !mailboxId) {
    console.warn('[mailbox:bird] EMAIL_API_KEY or BIRD_MAILBOX_ID is not set; skipping send.')
    console.log(`[mailbox:fallback] to=${options.to.join(', ')} subject="${options.subject}"`)
    return
  }

  const bird = new BirdClient({ apiKey })

  try {
    const message = await bird.email.mailboxes.messages.create(mailboxId, {
      to: options.to,
      subject: options.subject,
      text: options.text,
    })
    console.log(`[mailbox:bird] composed message id=${message.id}`)
    return message
  } catch (error) {
    console.error('[mailbox:bird] compose failed', error)
  }
}

// Reply within an existing conversation thread — used by the inbound-email
// webhook handler (see /api/webhooks/bird) to send an instant acknowledgment
// to a customer. Unlike composeFromMailbox(), this targets a specific
// received message, so Bird derives the recipient, subject, and threading
// headers automatically rather than starting a new conversation.
export async function replyInThread(options: {
  threadId: string
  messageId: string
  text: string
}) {
  const apiKey = process.env.EMAIL_API_KEY

  if (!apiKey) {
    console.warn('[mailbox:bird] EMAIL_API_KEY is not set; skipping reply.')
    return
  }

  const bird = new BirdClient({ apiKey })

  try {
    const reply = await bird.email.threads.messages.reply(
      options.threadId,
      options.messageId,
      { text: options.text },
    )
    console.log(`[mailbox:bird] replied in thread=${options.threadId} id=${reply.id}`)
    return reply
  } catch (error) {
    console.error('[mailbox:bird] reply failed', error)
  }
}
