import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Simple edge rate limiter using in-memory map (resets per cold start)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || record.resetAt <= now) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= limit) return false;
  record.count++;
  return true;
}

// Lazy cleanup: only runs when map grows large, avoids setInterval leak in edge runtime
function maybeCleanup() {
  if (rateLimitMap.size > 200) {
    const now = Date.now();
    for (const [key, val] of rateLimitMap) {
      if (val.resetAt <= now) rateLimitMap.delete(key);
    }
  }
}

const API_RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  "/api/likes": { limit: 30, windowMs: 60_000 },
  "/api/comments": { limit: 15, windowMs: 60_000 },
  "/api/newsletter": { limit: 5, windowMs: 60_000 },
  "/api/contact": { limit: 5, windowMs: 60_000 },
  "/api/views": { limit: 30, windowMs: 60_000 },
  "/api/ebooks/download": { limit: 5, windowMs: 60_000 },
  "/api/revalidate": { limit: 10, windowMs: 60_000 },
};

export function middleware(request: NextRequest) {
  maybeCleanup();
  const { pathname } = request.nextUrl;
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  // API rate limiting at edge
  for (const [prefix, config] of Object.entries(API_RATE_LIMITS)) {
    if (pathname.startsWith(prefix)) {
      if (!getRateLimit(`api:${ip}:${prefix}`, config.limit, config.windowMs)) {
        return NextResponse.json(
          { error: "Too many requests" },
          { status: 429 }
        );
      }
      break;
    }
  }

  const response = NextResponse.next();

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("X-XSS-Protection", "1; mode=block");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload"
  );

  // Prevent MIME sniffing and add CSP for API routes
  if (pathname.startsWith("/api/")) {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'none'; frame-ancestors 'none'"
    );
  }

  // Block common bot scanners on API routes
  if (pathname.startsWith("/api/")) {
    const ua = request.headers.get("user-agent") || "";
    const suspiciousBots =
      /scrapy|curl|wget|python-requests|go-http|java\/|perl|ruby/i.test(ua);
    if (suspiciousBots && !pathname.startsWith("/api/cron")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  // Block direct access to admin routes from non-admin
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    // Admin should be separate app, block any unexpected access
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/api/:path*",
    "/admin/:path*",
    "/((?!_next/static|_next/image|favicon.ico|images/).*)",
  ],
};
