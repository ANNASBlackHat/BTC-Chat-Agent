import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken } from './lib/auth';

/**
 * Next.js Edge proxy to intercept incoming requests and enforce auth.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Exclude public static files, favicon, login page, and authentication API route
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/favicon.ico' ||
    pathname === '/next.svg' ||
    pathname === '/vercel.svg'
  ) {
    return NextResponse.next();
  }

  // 2. Retrieve session token and verify validity
  const sessionToken = request.cookies.get('session_token')?.value;
  const isValid = await verifySessionToken(sessionToken);

  // 3. If invalid session, intercept the request
  if (!isValid) {
    // Return standard API 401 Unauthorized for API requests
    if (pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ error: 'Unauthorized: Session invalid or expired' }),
        {
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // Redirect standard web page requests to the /login page
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // 4. Proceed to authorized route
  return NextResponse.next();
}

/**
 * Configure standard path matcher rules.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
