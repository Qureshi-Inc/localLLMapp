import { PrismaClient } from '@prisma/client';

import { Post, PostCreateInput, PostUpdateInput, User, UserCreateInput } from './types';

const prismaClient = new PrismaClient();

function prismaPostToAppPost(post: any): Post {
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

function appPlatformToPrisma(platform: string): string {
  const reverseMap: Record<string, string> = {
    Instagram: 'INSTAGRAM',
    Facebook: 'FACEBOOK',
    LinkedIn: 'LINKEDIN',
    X: 'X',
    TikTok: 'TIKTOK',
  };
  return reverseMap[platform] || platform;
}

function appStatusToPrisma(status: string): string {
  return status.toUpperCase();
}

function prismaUserToAppUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    password: '',
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}

export async function getAllPosts(): Promise<Post[]> {
  const posts = await prismaClient.post.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return posts.map(prismaPostToAppPost);
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  const posts = await prismaClient.post.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
  return posts.map(prismaPostToAppPost);
}

export async function getPostById(id: string, userId: string): Promise<Post | null> {
  const post = await prismaClient.post.findFirst({
    where: { id: Number(id), userId },
  });
  return post ? prismaPostToAppPost(post) : null;
}

export async function createPost(input: PostCreateInput): Promise<Post> {
  const post = await prismaClient.post.create({
    data: {
      userId: input.userId,
      title: input.title,
      caption: input.caption,
      platform: appPlatformToPrisma(input.platform) as any,
      status: appStatusToPrisma(input.status) as any,
      scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      campaign: input.campaign || null,
      notes: input.notes || null,
      imageUrl: input.imageUrl || null,
    },
  });
  return prismaPostToAppPost(post);
}

export async function updatePost(id: string, userId: string, updates: PostUpdateInput): Promise<Post | null> {
  const updateData: any = {};

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.caption !== undefined) updateData.caption = updates.caption;
  if (updates.platform !== undefined) updateData.platform = appPlatformToPrisma(updates.platform) as any;
  if (updates.status !== undefined) updateData.status = appStatusToPrisma(updates.status) as any;
  if (updates.scheduledAt !== undefined) updateData.scheduledAt = updates.scheduledAt ? new Date(updates.scheduledAt) : null;
  if (updates.campaign !== undefined) updateData.campaign = updates.campaign || null;
  if (updates.notes !== undefined) updateData.notes = updates.notes || null;
  if (updates.imageUrl !== undefined) updateData.imageUrl = updates.imageUrl || null;

  const post = await prismaClient.post.findFirst({
    where: { id: Number(id), userId },
  });

  if (!post) return null;

  const updated = await prismaClient.post.update({
    where: { id: Number(id) },
    data: updateData,
  });

  return prismaPostToAppPost(updated);
}

export async function deletePost(id: string, userId: string): Promise<boolean> {
  const result = await prismaClient.post.deleteMany({
    where: { id: Number(id), userId },
  });
  return result.count > 0;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prismaClient.user.findUnique({
    where: { email },
  });
  return user ? prismaUserToAppUser(user) : null;
}

export async function getUserById(id: string): Promise<User | null> {
  const user = await prismaClient.user.findUnique({
    where: { id },
  });
  return user ? prismaUserToAppUser(user) : null;
}

export async function createUser(input: UserCreateInput): Promise<User> {
  const user = await prismaClient.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.password,
    },
  });
  return prismaUserToAppUser(user);
}

export { prismaClient };
