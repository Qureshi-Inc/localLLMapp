import { NextRequest, NextResponse } from 'next/server';

import { prismaClient } from '@/lib/db';
import { getSession } from '@/lib/session';
import { PLATFORMS, STATUSES } from '@/lib/types';

function isValidISODate(str: string): boolean {
  const date = new Date(str);
  return !isNaN(date.getTime());
}

const VALID_SORT_FIELDS = ['scheduledAt', 'createdAt', 'title', 'platform', 'status', 'id'];
const PLATFORM_MAP: Record<string, string> = {
  Instagram: 'INSTAGRAM',
  Facebook: 'FACEBOOK',
  LinkedIn: 'LINKEDIN',
  X: 'X',
  TikTok: 'TIKTOK',
};
const STATUS_MAP: Record<string, string> = {
  IDEA: 'IDEA',
  DRAFT: 'DRAFT',
  SCHEDULED: 'SCHEDULED',
  PUBLISHED: 'PUBLISHED',
};

function prismaPostToAppPost(post: any) {
  const platformMap: Record<string, string> = {
    INSTAGRAM: 'Instagram',
    FACEBOOK: 'Facebook',
    LINKEDIN: 'LinkedIn',
    X: 'X',
    TIKTOK: 'TikTok',
  };

  const statusMap: Record<string, string> = {
    IDEA: 'IDEA',
    DRAFT: 'DRAFT',
    SCHEDULED: 'SCHEDULED',
    PUBLISHED: 'PUBLISHED',
  };

  return {
    id: String(post.id),
    userId: post.userId,
    title: post.title,
    caption: post.caption,
    platform: platformMap[post.platform] || post.platform,
    status: statusMap[post.status] || post.status,
    scheduledAt: post.scheduledAt?.toISOString() || null,
    campaign: post.campaign || null,
    notes: post.notes || null,
    imageUrl: post.imageUrl || null,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const platform = searchParams.get('platform');
    const status = searchParams.get('status');
    const sortBy = searchParams.get('sortBy') || 'scheduledAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');

    const page = Math.max(1, parseInt(pageParam || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(limitParam || '10', 10)));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      userId: session.userId,
    };

    if (search) {
      where.AND = [
        {
          OR: [
            { title: { contains: search, mode: 'insensitive' as any } },
            { caption: { contains: search, mode: 'insensitive' as any } },
          ],
        },
      ];
    }

    if (platform) {
      const prismaPlatform = PLATFORM_MAP[platform];
      if (prismaPlatform) {
        where.platform = prismaPlatform;
      }
    }

    if (status) {
      const prismaStatus = STATUS_MAP[status];
      if (prismaStatus) {
        where.status = prismaStatus;
      }
    }

    const validSortField = VALID_SORT_FIELDS.includes(sortBy) ? sortBy : 'scheduledAt';
    const validSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const orderBy: Record<string, 'asc' | 'desc'> = {
      [validSortField]: validSortOrder,
    };

    const [totalPosts, posts] = await prismaClient.$transaction([
      prismaClient.post.count({ where }),
      prismaClient.post.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    const appPosts = posts.map(prismaPostToAppPost);

    return NextResponse.json(
      {
        posts: appPosts,
        total: totalPosts,
        page,
        limit,
        totalPages,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Posts GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
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

    const post = await prismaClient.post.create({
      data: {
        userId: session.userId,
        title: title.trim(),
        caption: caption.trim(),
        platform: PLATFORM_MAP[platform] as any,
        status: status.toUpperCase() as any,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        campaign: campaign || null,
        notes: notes || null,
        imageUrl: imageUrl || null,
      },
    });

    const appPost = prismaPostToAppPost(post);
    return NextResponse.json(appPost, { status: 201 });
  } catch (error) {
    console.error('Posts POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
