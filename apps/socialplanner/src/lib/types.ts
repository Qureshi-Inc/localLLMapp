export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

export type UserCreateInput = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;

export interface Post {
  id: string;
  userId: string;
  title: string;
  caption: string;
  platform: 'Instagram' | 'Facebook' | 'LinkedIn' | 'X' | 'TikTok';
  status: 'IDEA' | 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  scheduledAt: string | null;
  campaign: string | null;
  notes: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export const PLATFORMS = ['Instagram', 'Facebook', 'LinkedIn', 'X', 'TikTok'] as const;
export const STATUSES = ['IDEA', 'DRAFT', 'SCHEDULED', 'PUBLISHED'] as const;

export type PostCreateInput = Omit<Post, 'id' | 'createdAt' | 'updatedAt'>;

export type PostUpdateInput = Partial<Omit<Post, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;
