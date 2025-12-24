import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // Allow everything on localhost
  if (host.includes("localhost")) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const isAdminSubdomain = host.startsWith("admin.");

  // If on admin subdomain, allow /admin routes
  if (isAdminSubdomain) {
    // If not already on /admin path, redirect to /admin
    if (!pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // If NOT on admin subdomain but trying to access /admin, redirect to home
  if (!isAdminSubdomain && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)',
  ],
};