import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

import { ENV } from '@/config/env';

const JWT_SECRET = new TextEncoder().encode(ENV.JWT_SECRET);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const moodleSession = request.cookies.get('moodle_session')?.value;
  const { pathname } = request.nextUrl;

  // Paths that don't require authentication
  if (pathname.startsWith('/login') || pathname.startsWith('/api/auth')) {
    // If we have both cookies, we consider the user already logged in
    if (token && moodleSession) {
      try {
        await jose.jwtVerify(token, JWT_SECRET);
        return NextResponse.redirect(new URL('/', request.url));
      } catch {
        // Token invalid, allow access to login
      }
    }
    return NextResponse.next();
  }

  // Protect all other routes
  if (!token || !moodleSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jose.jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    console.error('JWT verification failed:', error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
