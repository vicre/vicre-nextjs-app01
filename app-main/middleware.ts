// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1) If request is to /api/protected/*, verify the API key.
  if (pathname.startsWith('/api/protected')) {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.MY_SECRET_API_KEY) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Missing or invalid API key' }),
        {
          status: 403,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    // If the API key matches, proceed
    return NextResponse.next();
  }

  // 2) If it’s exactly /login, allow it
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // 3) Otherwise, for all non-API routes, check the "msalUser" cookie
  const msalUser = request.cookies.get('msalUser');
  if (!msalUser) {
    // No user -> redirect to /login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If msalUser cookie exists, user is logged in -> allow request
  return NextResponse.next();
}

// For Next.js 13+ (Route Matcher Config)
export const config = {
  matcher: [
    // Apply this middleware to /api/protected/* so we can do the API-key check
    '/api/protected/:path*',
    // And apply to all other pages except _next/static, _next/image, favicon.ico
    // (which we usually don’t want to block with auth checks)
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
