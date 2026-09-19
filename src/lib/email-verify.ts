// Lightweight, dependency-free email fraud/spam screening for public forms.
// Two checks, both server-side: a disposable-domain blocklist, and an MX
// record lookup to catch typos and domains that cannot receive mail at all.
//
// Deliberately does NOT do click-to-confirm double opt-in. That would add a
// real step between a visitor and becoming a lead, and the cost of a fake
// submission here is low (it's reviewed by a human before any repair work
// happens) — the cost of losing a genuine lead to unnecessary friction is
// not worth trading for marginally cleaner data.
//
// DNS failures fail OPEN except for the two error codes that specifically
// mean "this domain cannot receive mail" (ENOTFOUND, ENODATA). Any other
// DNS error (timeout, resolver issue, etc.) is our infrastructure's
// problem, not the customer's, and must never block a real lead.

import { resolveMx } from 'node:dns/promises'

// Not exhaustive — new disposable-email services appear constantly — but
// covers the large majority of throwaway addresses seen in form spam.
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'mailinator.net',
  'mailinator.org',
  '10minutemail.com',
  '10minutemail.net',
  'guerrillamail.com',
  'guerrillamail.net',
  'guerrillamail.org',
  'guerrillamail.biz',
  'sharklasers.com',
  'grr.la',
  'spam4.me',
  'tempmail.com',
  'temp-mail.org',
  'temp-mail.io',
  'tempmailo.com',
  'tempinbox.com',
  'throwawaymail.com',
  'throwaway.email',
  'yopmail.com',
  'yopmail.net',
  'yopmail.fr',
  'trashmail.com',
  'trashmail.net',
  'trash-mail.com',
  'dispostable.com',
  'fakeinbox.com',
  'fakemailgenerator.com',
  'getnada.com',
  'getairmail.com',
  'maildrop.cc',
  'mailnesia.com',
  'mailcatch.com',
  'mintemail.com',
  'mytemp.email',
  'moakt.com',
  'emailondeck.com',
  'discard.email',
  'discardmail.com',
  'spamgourmet.com',
  'mohmal.com',
  'inboxbear.com',
  'tempr.email',
  'burnermail.io',
  '33mail.com',
  'anonaddy.me',
  'nowmymail.com',
])

export interface EmailCheckResult {
  deliverable: boolean
  reason?: string
}

export async function verifyEmailDeliverable(email: string): Promise<EmailCheckResult> {
  const domain = email.split('@')[1]?.toLowerCase().trim()
  if (!domain) {
    return { deliverable: false, reason: 'Enter a valid email address.' }
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      deliverable: false,
      reason: 'Temporary/disposable email addresses are not accepted. Please use a real address so we can reach you.',
    }
  }

  try {
    const records = await resolveMx(domain)
    if (!records || records.length === 0) {
      return { deliverable: false, reason: 'This email domain cannot receive mail. Please check for a typo.' }
    }
  } catch (error) {
    const code = (error as NodeJS.ErrnoException)?.code
    if (code === 'ENOTFOUND' || code === 'ENODATA') {
      return { deliverable: false, reason: 'This email domain does not exist. Please check for a typo.' }
    }
    // Any other failure (timeout, resolver hiccup, etc.) is ours, not the
    // customer's — do not block a real lead over it.
    console.warn(`[email-verify] MX lookup failed for domain=${domain}, allowing through`, error)
  }

  return { deliverable: true }
}
