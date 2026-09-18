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
