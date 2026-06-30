'use client';

import Link from 'next/link';
import { useSession, User } from '@/contexts/SessionContext';

export default function Home() {
  const { user, loading } = useSession();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-2">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const displayName = user?.name || user?.email || 'User';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-8 text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to SocialPlanner</h1>
        <h2 className="text-2xl font-semibold mb-6 text-gray-700">
          Hello, {displayName}!
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Plan and manage your social media content efficiently.
        </p>
        {user && (
          <Link
            href="/posts/new"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Create New Post
          </Link>
        )}
      </main>
    </div>
  );
}
