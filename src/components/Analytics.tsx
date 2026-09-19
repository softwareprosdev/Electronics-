import Script from 'next/script'

function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  if (!gaId) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', { anonymize_ip: true });
        `}
      </Script>
    </>
  )
}

// Self-hosted Umami (see /opt/traceworks-stack on the automation VPS,
// analytics.traceworkslab.com). Without this script tag, Umami's dashboard
// runs but has nothing sending it events — the tag is what actually
// reports visits, it's not optional wiring.
function UmamiAnalytics() {
  const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID
  if (!websiteId) return null

  return (
    <Script
      src="https://analytics.traceworkslab.com/script.js"
      data-website-id={websiteId}
      strategy="afterInteractive"
    />
  )
}

export function Analytics() {
  return (
    <>
      <GoogleAnalytics />
      <UmamiAnalytics />
    </>
  )
}
