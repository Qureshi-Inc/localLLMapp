'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Post, PLATFORMS, STATUSES } from '@/lib/types';

interface PostsResponse {
  posts: Post[];
  total: number;
  page: number;
  pageSize: number;
}

const PAGE_SIZE = 10;

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  if (diffMonth < 12) return `${diffMonth}mo ago`;
  return `${diffYear}y ago`;
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

const statusColors: Record<Post['status'], string> = {
  IDEA: 'bg-yellow-100 text-yellow-800',
  DRAFT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  PUBLISHED: 'bg-green-100 text-green-800',
};

function PostsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const searchQuery = searchParams.get('search') || '';
  const platformFilter = searchParams.get('platform') || '';
  const statusFilter = searchParams.get('status') || '';
  const sortParam = searchParams.get('sort') || 'desc';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [posts, setPosts] = useState<Post[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(searchQuery);

  const setPage = useCallback((newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.replace(`?${params.toString()}`);
  }, [searchParams, router]);

  const setFilter = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === '') {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete('page');
    router.replace(`?${params.toString()}`);
  }, [searchParams, router]);

  useEffect(() => {
    const params = new URLSearchParams({
      ...(searchQuery && { search: searchQuery }),
      ...(platformFilter && { platform: platformFilter }),
      ...(statusFilter && { status: statusFilter }),
      sort: sortParam,
      page: String(pageParam),
      pageSize: String(PAGE_SIZE),
    });

    const controller = new AbortController();

    setLoading(true);
    setError(null);

    fetch(`/api/posts?${params.toString()}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data: PostsResponse) => {
        setPosts(data.posts);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err: any) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Failed to fetch posts');
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [searchQuery, platformFilter, statusFilter, sortParam, pageParam]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);

    setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === '') {
        params.delete('search');
      } else {
        params.set('search', value);
      }
      params.delete('page');
      router.replace(`?${params.toString()}`);
    }, 300);
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <>
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="search"
          value={searchInput}
          onChange={handleSearchChange}
          placeholder="Search by title or caption..."
          className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        />
        <select
          value={platformFilter}
          onChange={(e) => setFilter('platform', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
        >
          <option value="">All Platforms</option>
          {PLATFORMS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setFilter('status', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          value={sortParam}
          onChange={(e) => setFilter('sort', e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white"
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-500 text-sm">Loading posts...</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-gray-500 text-lg mb-2">No posts found.</p>
          <p className="text-gray-400 text-sm mb-4">Try adjusting your filters or create a new post.</p>
          <Link
            href="/posts/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
          >
            Create New Post
          </Link>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="hidden md:block overflow-hidden rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Platform</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/posts/${post.id}`}
                  className="block hover:bg-gray-50 transition"
                >
                  <tr className="cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {post.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.platform}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                        {post.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(post.scheduledAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {post.campaign || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatRelativeDate(post.updatedAt)}
                    </td>
                  </tr>
                </Link>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="md:hidden space-y-3">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/posts/${post.id}`}
              className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-900 truncate flex-1 mr-2">
                  {post.title}
                </h3>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[post.status]}`}>
                  {post.status}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>{post.platform}</span>
                <span>{formatDate(post.scheduledAt)}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                <span>{post.campaign || '—'}</span>
                <span>{formatRelativeDate(post.updatedAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {!loading && posts.length > 0 && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => setPage(pageParam - 1)}
            disabled={pageParam <= 1}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {pageParam} of {totalPages || 1}
          </span>
          <button
            onClick={() => setPage(pageParam + 1)}
            disabled={pageParam >= totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </>
  );
}

export default function PostsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
        <Link
          href="/posts/new"
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-medium"
        >
          New Post
        </Link>
      </div>

      <Suspense fallback={
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse"></div>
          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse w-32"></div>
          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse w-32"></div>
          <div className="px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 animate-pulse w-32"></div>
        </div>
      }>
        <PostsContent />
      </Suspense>
    </div>
  );
}
