// middleware.js at the root of your project

import { NextResponse } from 'next/server';
import { createSecureHeaders } from 'next-secure-headers';

export function middleware(request) {
  const headers = createSecureHeaders({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: "'self'",
        // ... other directives
      },
    },
    // ... other security headers
  });

  const response = NextResponse.next();

  // Set the secure headers
  for (const [key, value] of Object.entries(headers)) {
    response.headers.set(key, value);
  }

  return response;
}
