import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

import { Post, PostCreateInput, PostUpdateInput } from './types';

const DB_PATH = path.join(process.cwd(), 'data', 'posts.json');

function readPosts(): Post[] {
  if (!fs.existsSync(DB_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writePosts(posts: Post[]): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(posts, null, 2));
}

export async function getPostsByUser(userId: string): Promise<Post[]> {
  const posts = readPosts();
  return posts.filter(post => post.userId === userId);
}

export async function getPostById(id: string, userId: string): Promise<Post | null> {
  const posts = readPosts();
  const post = posts.find(p => p.id === id && p.userId === userId);
  return post || null;
}

export async function createPost(input: PostCreateInput): Promise<Post> {
  const posts = readPosts();
  const now = new Date().toISOString();
  const newPost: Post = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };
  posts.push(newPost);
  writePosts(posts);
  return newPost;
}

export async function updatePost(id: string, userId: string, updates: PostUpdateInput): Promise<Post | null> {
  const posts = readPosts();
  const index = posts.findIndex(p => p.id === id && p.userId === userId);
  if (index === -1) return null;
  posts[index] = { ...posts[index], ...updates, updatedAt: new Date().toISOString() };
  writePosts(posts);
  return posts[index];
}

export async function deletePost(id: string, userId: string): Promise<boolean> {
  const posts = readPosts();
  const index = posts.findIndex(p => p.id === id && p.userId === userId);
  if (index === -1) return false;
  posts.splice(index, 1);
  writePosts(posts);
  return true;
}
