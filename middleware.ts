import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;

  // Allow everything on localhost
  if (host.includes("localhost")) {
    return NextResponse.next();
  }

  const isAdminSubdomain = host.startsWith("admin.");

  /* =========================
     ADMIN SUBDOMAIN HANDLING
  ========================= */
  if (isAdminSubdomain) {
    // Force /admin base path
    if (!pathname.startsWith("/admin")) {
      return NextResponse.rewrite(new URL("/admin", request.url));
    }

    // Pages that do NOT require login
    const publicAdminPaths = [
      "/admin",
      "/admin/forgot-password"
    ];

    const isPublicAdminPage = publicAdminPaths.includes(pathname);

    if (!isPublicAdminPage) {
      const token =
        request.cookies.get("admin_token") ||
        request.headers.get("authorization");

      // If token missing, redirect to admin login
      if (!token) {
        return NextResponse.redirect(
          new URL("/admin", request.url)
        );
      }
    }

    return NextResponse.next();
  }

  /* =========================
     BLOCK ADMIN PATH ON NON-ADMIN DOMAIN
  ========================= */
  if (!isAdminSubdomain && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Exclude:
     * - static files
     * - images
     * - api routes
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\..*|api).*)",
  ],
};
