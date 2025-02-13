// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

  // 3) Check if we have the "msalUser" cookie
  const msalUser = request.cookies.get("msalUser");
  if (!msalUser) {
    // No user -> redirect to /login
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("returnUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Otherwise, user is logged in
  return NextResponse.next();
}

// For Next.js 13+ 
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
