import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// All auth is handled by requireAdmin() in API routes and pages.
// This middleware is intentionally minimal — no-op passthrough.

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
