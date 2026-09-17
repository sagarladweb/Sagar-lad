import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Defense-in-depth: verify session cookie exists before hitting route handlers.
// Individual routes still call requireAdmin() for full session + role check.
// This blocks unauthenticated requests at the edge, before they reach any handler.

const SESSION_COOKIE = "next-auth.session-token";
const SESSION_COOKIE_SECURE = "__Secure-next-auth.session-token";

// Admin login page and auth callback are public
const PUBLIC_PATHS = ["/admin/login", "/api/auth"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for session cookie (either regular or secure variant)
  const hasCookie =
    request.cookies.has(SESSION_COOKIE) ||
    request.cookies.has(SESSION_COOKIE_SECURE);

  if (!hasCookie) {
    // No session cookie at all — redirect to login (pages) or 401 (API)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
