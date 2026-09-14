// Defense-in-depth CSRF mitigation for state-changing admin routes, per the
// OWASP CSRF Prevention Cheat Sheet's "Verifying Origin with Standard
// Headers" pattern. SameSite=Lax cookies already block most cross-site
// form-based CSRF; this additionally rejects any request whose Origin (or,
// failing that, Referer) does not match the app's own host.

import { siteConfig } from './site-config'

function hostFromUrl(url: string): string | null {
  try {
    return new URL(url).host
  } catch {
    return null
  }
}

export function isTrustedOrigin(request: Request): boolean {
  const requestHost = request.headers.get('host')
  if (!requestHost) return false

  const origin = request.headers.get('origin')
  if (origin) {
    return hostFromUrl(origin) === requestHost
  }

  // Some same-site requests (older browsers, certain proxies) omit Origin
  // on same-site navigations; fall back to Referer, then to the configured
  // site URL as a last resort so legitimate same-host requests still work.
  const referer = request.headers.get('referer')
  if (referer) {
    return hostFromUrl(referer) === requestHost
  }

  const configuredHost = hostFromUrl(siteConfig.url)
  return configuredHost === requestHost
}
