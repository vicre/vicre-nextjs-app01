// pages/_middleware.js (for Next.js versions supporting middleware)

import { createSecureHeaders } from 'next-secure-headers';

export function middleware(req, ev) {
  const headers = createSecureHeaders({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: "'self'",
        // ... other directives
      },
    },
    // ... other security headers
  });

  return NextResponse.next({
    headers,
  });
}
