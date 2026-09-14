import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { SignOutButton } from '@/components/admin/SignOutButton'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8">
      {session && (
        <aside className="panel h-fit w-full flex-none p-4 lg:w-56">
          <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Laboratory Admin
          </p>
          <nav className="mt-4 flex flex-col gap-1">
            <Link href="/admin" className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2">
              Repair Queue
            </Link>
          </nav>
          <p className="mt-6 truncate text-xs text-lab-muted">{session.email}</p>
          <SignOutButton />
        </aside>
      )}
      <div className="flex-1">{children}</div>
    </div>
  )
}
