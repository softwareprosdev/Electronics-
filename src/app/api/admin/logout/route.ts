import { NextResponse } from 'next/server'
import { ADMIN_SESSION_COOKIE } from '@/lib/auth'
import { isTrustedOrigin } from '@/lib/csrf'

export async function POST(request: Request) {
  if (!isTrustedOrigin(request)) {
    return NextResponse.json({ error: 'Invalid request origin.' }, { status: 403 })
  }

  const response = NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'no-store' } })
  response.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 })
  return response
}
