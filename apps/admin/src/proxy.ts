import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Defense-in-depth: verify session cookie exists before hitting route handlers.
// Individual routes still call requireAdmin() for full session + role check.
// This blocks unauthenticated requests at the edge, before they reach any handler.

const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
  "next-auth.session-token",
  "__Secure-next-auth.session-token",
];

function hasSessionCookie(request: NextRequest): boolean {
  return request.cookies.getAll().some(
    (c) =>
      (c.name.includes("session-token") || SESSION_COOKIE_NAMES.includes(c.name)) &&
      Boolean(c.value && c.value.trim().length > 0)
  );
}

// Admin login page and auth callback are public
const PUBLIC_PATHS = ["/login", "/api/auth"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasCookie = hasSessionCookie(request);

  // If already authenticated and visiting login endpoints, forward directly to dashboard
  if (hasCookie && (pathname === "/admin" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }

  // Allow login page and NextAuth API callbacks
  if (pathname === "/admin" || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check for session cookie (either regular or secure variant)
  if (!hasCookie) {
    // No session cookie at all — redirect to login (pages) or 401 (API)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};

