import Link from 'next/link'
import { getAdminSession } from '@/lib/auth'
import { SignOutButton } from '@/components/admin/SignOutButton'
import { PRICING_VIEW_ROLES, MARKETING_VIEW_ROLES } from '@/lib/rbac'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession()
  const canViewPricing =
    session && PRICING_VIEW_ROLES.includes(session.role as (typeof PRICING_VIEW_ROLES)[number])
  const canViewMarketing =
    session && MARKETING_VIEW_ROLES.includes(session.role as (typeof MARKETING_VIEW_ROLES)[number])

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:px-8 print:block print:max-w-none print:p-0">
      {session && (
        <aside className="panel h-fit w-full flex-none p-4 print:hidden lg:w-56">
          <p className="text-xs font-semibold uppercase tracking-wide text-lab-muted">
            Laboratory Admin
          </p>
          <nav className="mt-4 flex flex-col gap-1">
            <Link href="/admin" className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2">
              Dashboard
            </Link>
            <Link
              href="/admin/repairs"
              className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2"
            >
              Repair Queue
            </Link>
            <Link
              href="/admin/my-repairs"
              className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2"
            >
              My Repairs
            </Link>
            <Link
              href="/admin/leads"
              className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2"
            >
              Leads &amp; Inquiries
            </Link>
            <Link
              href="/admin/customers"
              className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2"
            >
              Customers
            </Link>
            <Link
              href="/admin/devices"
              className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2"
            >
              Devices
            </Link>
            <Link
              href="/admin/inventory"
              className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2"
            >
              Inventory
            </Link>
            <Link
              href="/admin/orders"
              className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2"
            >
              Orders
            </Link>
            {canViewPricing && (
              <>
                <Link
                  href="/admin/pricing"
                  className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2"
                >
                  Pricing Engine
                </Link>
                <Link
                  href="/admin/pricing/rules"
                  className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2"
                >
                  Pricing Rules
                </Link>
              </>
            )}
            {canViewMarketing && (
              <Link
                href="/admin/marketing"
                className="rounded-sm px-3 py-2 text-sm text-lab-text hover:bg-lab-panel2"
              >
                Marketing Swarm
              </Link>
            )}
          </nav>
          <Link
            href="/admin/account"
            className="mt-6 block truncate rounded-sm px-3 py-2 text-xs text-lab-muted hover:bg-lab-panel2 hover:text-lab-accent"
          >
            {session.email}
          </Link>
          <SignOutButton />
        </aside>
      )}
      <div className="flex-1">{children}</div>
    </div>
  )
}
