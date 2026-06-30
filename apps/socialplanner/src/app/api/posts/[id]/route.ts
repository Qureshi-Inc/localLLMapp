import { NextResponse } from 'next/server';

import { getPostById, updatePost, deletePost, getAllPosts } from '@/lib/db';
import { auth } from '@/lib/auth';
import { PostUpdateInput } from '@/lib/types';

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const post = await getPostById(id, user.userId);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    const { title, caption, platform, status, scheduledAt, campaign, notes, imageUrl } = body;

    const updateData: PostUpdateInput = {};

    if (title !== undefined) {
      if (typeof title !== 'string' || title.trim() === '') {
        return NextResponse.json({ error: 'title must be a non-empty string' }, { status: 400 });
      }
      updateData.title = title.trim();
    }

    if (caption !== undefined) {
      if (typeof caption !== 'string' || caption.trim() === '') {
        return NextResponse.json({ error: 'caption must be a non-empty string' }, { status: 400 });
      }
      updateData.caption = caption.trim();
    }

    if (platform !== undefined) {
      const validPlatforms = ['Instagram', 'Facebook', 'LinkedIn', 'X', 'TikTok'];
      if (!validPlatforms.includes(platform)) {
        return NextResponse.json({ error: `platform must be one of: ${validPlatforms.join(', ')}` }, { status: 400 });
      }
      updateData.platform = platform;
    }

    if (status !== undefined) {
      const validStatuses = ['IDEA', 'DRAFT', 'SCHEDULED', 'PUBLISHED'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json({ error: `status must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
      }
      updateData.status = status;
    }

    if (scheduledAt !== undefined) {
      if (scheduledAt !== null && (typeof scheduledAt !== 'string' || isNaN(new Date(scheduledAt).getTime()))) {
        return NextResponse.json({ error: 'scheduledAt must be a valid ISO date string or null' }, { status: 400 });
      }
      updateData.scheduledAt = scheduledAt || null;
    }

    if (campaign !== undefined) {
      if (campaign !== null && typeof campaign !== 'string') {
        return NextResponse.json({ error: 'campaign must be a string or null' }, { status: 400 });
      }
      updateData.campaign = campaign || null;
    }

    if (notes !== undefined) {
      if (notes !== null && typeof notes !== 'string') {
        return NextResponse.json({ error: 'notes must be a string or null' }, { status: 400 });
      }
      updateData.notes = notes || null;
    }

    if (imageUrl !== undefined) {
      if (imageUrl !== null && typeof imageUrl !== 'string') {
        return NextResponse.json({ error: 'imageUrl must be a string or null' }, { status: 400 });
      }
      updateData.imageUrl = imageUrl || null;
    }

    const post = await updatePost(id, user.userId, updateData);

    if (!post) {
      return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();

    if (!body || Object.keys(body).length === 0) {
      return NextResponse.json({ error: 'Request body is required' }, { status: 400 });
    }

    if ('scheduledAt' in body) {
      if (body.scheduledAt !== null && (typeof body.scheduledAt !== 'string' || isNaN(new Date(body.scheduledAt).getTime()))) {
        return NextResponse.json({ error: 'scheduledAt must be a valid ISO date string or null' }, { status: 400 });
      }
    }

    const existingPost = await getPostById(id, user.userId);

    if (!existingPost) {
      const allPosts = await getAllPosts();
      const anyPost = allPosts.find(p => p.id === id);
      if (anyPost) {
        return NextResponse.json({ error: 'Forbidden: you do not own this post' }, { status: 403 });
      }
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const updateData: PostUpdateInput = {};

    if (body.scheduledAt !== undefined) {
      updateData.scheduledAt = body.scheduledAt || null;
    }

    const post = await updatePost(id, user.userId, updateData);

    if (!post) {
      return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json(post, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const user = await auth();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const deleted = await deletePost(id, user.userId);

    if (!deleted) {
      return NextResponse.json({ error: 'Post not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Post deleted successfully' }, { status: 200 });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
