const LINE_SEPARATOR = new RegExp(String.fromCharCode(0x2028), 'g')
const PARAGRAPH_SEPARATOR = new RegExp(String.fromCharCode(0x2029), 'g')

// Escape characters that could otherwise break out of the surrounding
// <script> element (`</script>`) or be interpreted as line terminators by
// some HTML parsers (U+2028/U+2029). Defense-in-depth: today's JSON-LD
// payloads are all built from static site content, but this guarantees
// the pattern stays safe even if a future caller feeds it user-controlled
// data.
function safeJsonLdString(data: Record<string, unknown>): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(LINE_SEPARATOR, '\\u2028')
    .replace(PARAGRAPH_SEPARATOR, '\\u2029')
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safeJsonLdString(data) }}
    />
  )
}
