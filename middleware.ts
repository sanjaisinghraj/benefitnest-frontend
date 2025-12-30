import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath = 
    path === '/admin' || 
    path === '/admin/login' || 
    path.startsWith('/admin/forgot-password') ||
    path.startsWith('/_next') ||
    path.startsWith('/static') ||
    path.startsWith('/images') ||
    path.startsWith('/api') // Allow API calls to pass through (handled by backend auth)

  // Only protect /admin routes
  if (path.startsWith('/admin') && !isPublicPath) {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      // Redirect to admin login page
      return NextResponse.redirect(new URL('/admin', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/admin/:path*',
  ],
}
