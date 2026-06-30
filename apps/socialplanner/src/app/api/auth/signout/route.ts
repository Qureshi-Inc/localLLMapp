import { NextResponse } from 'next/server';

import { destroySession } from '@/lib/session';

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ message: 'Signed out successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
