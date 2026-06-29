import { NextResponse } from 'next/server';

import { createPost, getPostsByUser } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { PLATFORMS, STATUSES } from '@/lib/types';

function isValidISODate(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime());
}

export async function GET() {
  try {
    const { userId } = requireAuth();
    const posts = await getPostsByUser(userId);
    return NextResponse.json(posts, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = requireAuth();
    const body = await request.json();

    const { title, caption, platform, status, scheduledAt, campaign, notes, imageUrl } = body;

    if (title === undefined || title === null || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ error: 'title is required and must be a non-empty string' }, { status: 400 });
    }

    if (caption === undefined || caption === null || typeof caption !== 'string' || caption.trim() === '') {
      return NextResponse.json({ error: 'caption is required and must be a non-empty string' }, { status: 400 });
    }

    if (!PLATFORMS.includes(platform as typeof PLATFORMS[number])) {
      return NextResponse.json({ error: `platform must be one of: ${PLATFORMS.join(', ')}` }, { status: 400 });
    }

    if (!STATUSES.includes(status as typeof STATUSES[number])) {
      return NextResponse.json({ error: `status must be one of: ${STATUSES.join(', ')}` }, { status: 400 });
    }

    if (scheduledAt !== undefined && scheduledAt !== null) {
      if (typeof scheduledAt !== 'string' || !isValidISODate(scheduledAt)) {
        return NextResponse.json({ error: 'scheduledAt must be a valid ISO date string' }, { status: 400 });
      }
    }

    if (campaign !== undefined && campaign !== null && typeof campaign !== 'string') {
      return NextResponse.json({ error: 'campaign must be a string or null' }, { status: 400 });
    }

    if (notes !== undefined && notes !== null && typeof notes !== 'string') {
      return NextResponse.json({ error: 'notes must be a string or null' }, { status: 400 });
    }

    if (imageUrl !== undefined && imageUrl !== null && typeof imageUrl !== 'string') {
      return NextResponse.json({ error: 'imageUrl must be a string or null' }, { status: 400 });
    }

    const post = await createPost({
      userId,
      title: title.trim(),
      caption: caption.trim(),
      platform: platform as typeof PLATFORMS[number],
      status: status as typeof STATUSES[number],
      scheduledAt: scheduledAt || null,
      campaign: campaign || null,
      notes: notes || null,
      imageUrl: imageUrl || null,
    });

    return NextResponse.json(post, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
