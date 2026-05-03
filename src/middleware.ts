import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/** Send visitors straight to Payload admin — no public marketing site in this project. */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname === '/' || pathname === '') {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    url.hash = ''
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/'],
}
