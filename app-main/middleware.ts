// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// "Matcher" below ensures we run this middleware on all pages (except /api routes).
// In Next.js 13, you can do more advanced matching. We'll keep it simple here.

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) Skip /api routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 2) Allow the /login page itself
  if (pathname === "/login") {
    return NextResponse.next();
  }

  // 3) Check if the user has the "msalUser" cookie
  // If not present, redirect to /login
  const msalUser = request.cookies.get("msalUser");
  if (!msalUser) {
    // Build a redirect URL to /login, optionally with a ?returnUrl=...
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, user is considered "logged in", continue
  return NextResponse.next();
}

// Next.js 13 uses a "config" export or the experimental matcher option:
// This runs for all routes by default, but we can exclude folders if desired
export const config = {
  // Optional: pattern to match all routes
  // "matcher" can be an array of patterns
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)", 
  ],
};
