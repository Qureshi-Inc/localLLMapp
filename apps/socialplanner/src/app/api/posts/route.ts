import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPostsByUser } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = requireAuth();
    const posts = await getPostsByUser(userId);
    return NextResponse.json(posts, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 });
  }
}
