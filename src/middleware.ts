import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login'
  if (!isAdminRoute) {
    return NextResponse.next()
  }

  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  const session = token ? await verifyAdminSessionToken(token) : null

  if (!session) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
