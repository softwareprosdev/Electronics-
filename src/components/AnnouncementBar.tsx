import Link from 'next/link'

export function AnnouncementBar() {
  return (
    <div className="border-b border-lab-line bg-lab-panel2 px-4 py-2 text-center text-xs text-lab-muted">
      Serving Harlingen to Mission &amp; the Rio Grande Valley &mdash; mail-in repairs accepted
      nationwide.{' '}
      <Link href="/mail-in-repair" className="text-lab-accent underline underline-offset-2">
        Ship us your board
      </Link>
    </div>
  )
}
