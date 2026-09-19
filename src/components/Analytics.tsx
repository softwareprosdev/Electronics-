import Script from 'next/script'

// GA4 and Google Ads conversion tracking share one gtag.js loader — only
// the first id in the script `src` actually matters, every id present gets
// its own gtag('config', ...) call so both report correctly.
function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID
  const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID
  const loaderId = gaId || adsId
  if (!loaderId) return null

  const configCalls = [gaId, adsId]
    .filter(Boolean)
    .map((id) => (id === gaId ? `gtag('config', '${id}', { anonymize_ip: true });` : `gtag('config', '${id}');`))
    .join('\n          ')

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${loaderId}`} strategy="afterInteractive" />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${configCalls}
        `}
      </Script>
    </>
  )
}

// Meta (Facebook/Instagram) Pixel — standalone script, unrelated to gtag.
function MetaPixel() {
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (!pixelId) return null

  return (
    <Script id="meta-pixel-init" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${pixelId}');
        fbq('track', 'PageView');
      `}
    </Script>
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
      <MetaPixel />
      <UmamiAnalytics />
    </>
  )
}
