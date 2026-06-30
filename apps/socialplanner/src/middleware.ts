import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getSession } from '@/lib/session';

const PUBLIC_PATHS = ['/login', '/register', '/api/health'];
const PUBLIC_API_PREFIX = '/api/auth';

const STATIC_EXTENSIONS = /\.(png|jpe?g|gif|ico|svg|css|js|woff2?|ttf|otf|eot|webp|json|txt)$/;

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) {
    return true;
  }
  if (pathname.startsWith(PUBLIC_API_PREFIX)) {
    return true;
  }
  if (pathname.startsWith('/_next')) {
    return true;
  }
  if (pathname === '/favicon.ico') {
    return true;
  }
  if (STATIC_EXTENSIONS.test(pathname)) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  const session = await getSession();

  if (pathname === '/login' || pathname === '/register') {
    if (session) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  if (!isPublicPath(pathname)) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('from', request.nextUrl.href);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
