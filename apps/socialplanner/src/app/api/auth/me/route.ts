import { NextResponse } from 'next/server';

import { getSession } from '@/lib/session';
import { getUserById } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();

    if (!session || !session.userId) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const user = await getUserById(session.userId);

    if (!user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
