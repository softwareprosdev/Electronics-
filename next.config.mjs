/** @type {import('next').NextConfig} */

// 'unsafe-inline' remains on script-src as an accepted, documented
// trade-off: a per-request nonce would force every page (including the 20+
// statically generated service/location pages) into dynamic rendering,
// which conflicts with this site's Core Web Vitals/SEO requirements. The
// residual risk is mitigated at the source instead — there is no
// dangerouslySetInnerHTML anywhere in this codebase that renders anything
// other than static, developer-authored content (see JsonLd.tsx, which is
// additionally hardened against script-tag breakout), and no eval/Function
// usage. Revisit if the app ever needs to render user-supplied HTML.
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://va.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://vitals.vercel-insights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; '),
  },
  // Isolates this origin's browsing context from cross-origin windows it
  // opens/is opened by, mitigating Spectre-style side-channel attacks.
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  // Blocks other origins from loading this site's resources (images, etc.)
  // into their own documents.
  { key: 'Cross-Origin-Resource-Policy', value: 'same-origin' },
  // Legacy Adobe Flash/Acrobat cross-domain policy opt-out, still
  // recommended by the OWASP Secure Headers Project.
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
]

const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ]
  },
}

export default nextConfig
