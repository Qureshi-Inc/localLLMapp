import { NextResponse } from 'next/server';

export function requireAuth(): { userId: string } {
  const headers = new Headers(typeof window === 'undefined' ? (globalThis as any).request?.headers : {});
  const userId = headers.get('x-user-id');

  if (!userId) {
    throw NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return { userId };
}
