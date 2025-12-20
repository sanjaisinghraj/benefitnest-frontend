import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";

  // ✅ Allow everything on localhost
  if (host.includes("localhost")) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;
  const isAdminSubdomain = host.startsWith("admin.");

  if (isAdminSubdomain && !pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  if (!isAdminSubdomain && pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}
