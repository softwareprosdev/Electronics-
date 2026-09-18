// Email/SMS provider abstraction. Defaults to console logging so the app
// runs without external credentials. Swap the "console" provider for a real
// integration (Bird, SES, Postmark, Twilio, etc.) by implementing the same
// function signature and switching on EMAIL_PROVIDER / SMS_PROVIDER.

import { BirdClient } from '@messagebird/sdk'

// EMAIL_FROM is a single "Name <email>" string; Bird wants the name/email
// split out.
function parseFromAddress(raw: string): { email: string; name?: string } {
  const match = raw.match(/^(.*?)\s*<(.+)>$/)
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, '')
    return { email: match[2].trim(), name: name || undefined }
  }
  return { email: raw.trim() }
}

async function sendViaBird(options: { to: string; subject: string; body: string }) {
  const apiKey = process.env.EMAIL_API_KEY
  const fromRaw = process.env.EMAIL_FROM || 'Bird <onboarding@messagebird.dev>'

  if (!apiKey) {
    console.warn('[email:bird] EMAIL_API_KEY is not set; falling back to console.')
    console.log(`[email:fallback] to=${options.to} subject="${options.subject}"`)
    return
  }

  const bird = new BirdClient({ apiKey })

  try {
    const msg = await bird.email.send({
      from: parseFromAddress(fromRaw),
      to: [options.to],
      subject: options.subject,
      html: `<p>${options.body}</p>`,
    })
    console.log(`[email:bird] sent id=${msg.id} status=${msg.status}`)
  } catch (error) {
    // Never throw — a notification-email failure must not block the form
    // submission that triggered it (the lead is already saved to the
    // database by the time sendEmail is called).
    console.error('[email:bird] send failed', error)
  }
}

export async function sendEmail(options: { to: string; subject: string; body: string }) {
  const provider = process.env.EMAIL_PROVIDER || 'console'

  if (provider === 'console') {
    console.log(`[email:${provider}] to=${options.to} subject="${options.subject}"`)
    return
  }

  if (provider === 'bird') {
    await sendViaBird(options)
    return
  }

  // Additional providers are wired in here (SES, Postmark, ...).
  console.warn(`Email provider "${provider}" is not yet implemented; falling back to console.`)
  console.log(`[email:fallback] to=${options.to} subject="${options.subject}"`)
}

export async function sendSms(options: { to: string; body: string }) {
  const provider = process.env.SMS_PROVIDER || 'console'

  if (provider === 'console') {
    console.log(`[sms:${provider}] to=${options.to}`)
    return
  }

  console.warn(`SMS provider "${provider}" is not yet implemented; falling back to console.`)
  console.log(`[sms:fallback] to=${options.to}`)
}
