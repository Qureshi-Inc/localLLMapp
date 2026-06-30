import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { getSession } from '@/lib/session';

const PUBLIC_PATHS = ['/login', '/register', '/api/health'];
const PUBLIC_API_PREFIX = '/api/auth';

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) {
    return true;
  }
  if (pathname.startsWith(PUBLIC_API_PREFIX)) {
    return true;
  }
  return false;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const session = await getSession();

  if (!session) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callback', request.nextUrl.href);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
