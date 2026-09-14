// Email/SMS provider abstraction. Defaults to console logging so the app
// runs without external credentials. Swap the "console" provider for a real
// integration (Resend, SES, Postmark, Twilio, etc.) by implementing the same
// function signature and switching on EMAIL_PROVIDER / SMS_PROVIDER.

export async function sendEmail(options: { to: string; subject: string; body: string }) {
  const provider = process.env.EMAIL_PROVIDER || 'console'

  if (provider === 'console') {
    console.log(`[email:${provider}] to=${options.to} subject="${options.subject}"`)
    return
  }

  // Additional providers are wired in here (Resend, SES, Postmark, ...).
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
