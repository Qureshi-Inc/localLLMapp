import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { getPostsByUser, Post } from '@/lib/db';

export async function GET() {
  try {
    const { userId } = requireAuth();
    const posts = await getPostsByUser(userId);

    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const totalPosts = posts.length;
    const draftPosts = posts.filter(post => post.status === 'DRAFT').length;
    const scheduledPosts = posts.filter(post => post.status === 'SCHEDULED').length;
    const publishedPosts = posts.filter(post => post.status === 'PUBLISHED').length;

    const upcomingPosts: Post[] = posts
      .filter(post => {
        if (post.status !== 'SCHEDULED') return false;
        if (!post.scheduledAt) return false;
        const scheduledDate = new Date(post.scheduledAt);
        return scheduledDate >= now && scheduledDate <= sevenDaysFromNow;
      })
      .sort((a, b) => {
        if (!a.scheduledAt || !b.scheduledAt) return 0;
        return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
      });

    return NextResponse.json({
      totalPosts,
      draftPosts,
      scheduledPosts,
      publishedPosts,
      upcomingPosts,
    }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
  }
}
