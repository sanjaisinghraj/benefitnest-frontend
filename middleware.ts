import { proxy } from './app-proxy'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  return proxy(request)
}

// Next.js expects the config to be exported directly from this file, not re-exported.
// We must duplicate the config here to satisfy the static analysis.
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api/).*)",
  ],
};
