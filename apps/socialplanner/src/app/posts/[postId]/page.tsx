import Link from 'next/link';
import { notFound } from 'next/navigation';

import { requireAuth } from '@/lib/auth';
import { getPostById } from '@/lib/db';
import { Post } from '@/lib/types';

async function getPost(postId: string, userId: string): Promise<Post | null> {
  return getPostById(postId, userId);
}

export default async function PostDetailPage({ params }: { params: { postId: string } }) {
  const userId = requireAuth();
  const { postId } = params;
  const post = await getPost(postId, userId);

  if (!post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-8">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">Post not found</h1>
        <Link
          href="/posts"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Back to Posts
        </Link>
      </div>
    );
  }

  const statusColors: Record<Post['status'], string> = {
    IDEA: 'bg-gray-100 text-gray-800',
    DRAFT: 'bg-yellow-100 text-yellow-800',
    SCHEDULED: 'bg-blue-100 text-blue-800',
    PUBLISHED: 'bg-green-100 text-green-800',
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/posts"
          className="text-blue-500 hover:text-blue-600 transition"
        >
          &larr; Back to Posts
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">{post.title}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[post.status]}`}
            >
              {post.status}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 space-y-4">
          {post.caption && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Caption</h2>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{post.caption}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Platform</h2>
              <p className="mt-1 text-gray-900">{post.platform}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Scheduled At</h2>
              <p className="mt-1 text-gray-900">
                {post.scheduledAt ? formatDate(post.scheduledAt) : 'Not scheduled'}
              </p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Campaign</h2>
              <p className="mt-1 text-gray-900">{post.campaign || 'None'}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Created</h2>
              <p className="mt-1 text-gray-900">{formatDate(post.createdAt)}</p>
            </div>

            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Updated</h2>
              <p className="mt-1 text-gray-900">{formatDate(post.updatedAt)}</p>
            </div>
          </div>

          {post.notes && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Notes</h2>
              <p className="mt-1 text-gray-900 whitespace-pre-wrap">{post.notes}</p>
            </div>
          )}

          {post.imageUrl && (
            <div>
              <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Image</h2>
              <div className="mt-2">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="max-w-full h-auto rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
