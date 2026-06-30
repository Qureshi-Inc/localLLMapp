import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'posts.json');

export interface Post {
  id: string;
  userId: string;
  title: string;
  content: string;
  status: 'DRAFT' | 'SCHEDULED' | 'PUBLISHED';
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

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

export async function getPostsByUser(userId: string): Promise<Post[]> {
  const posts = readPosts();
  return posts.filter(post => post.userId === userId);
}
