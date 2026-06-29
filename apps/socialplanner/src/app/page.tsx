import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <main className="flex flex-col items-center justify-center w-full flex-1 px-8 text-center">
        <h1 className="text-4xl font-bold mb-6">Welcome to SocialPlanner</h1>
        <p className="text-lg text-gray-600 mb-8">
          Plan and manage your social media content efficiently.
        </p>
        <Link
          href="/posts/new"
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Create New Post
        </Link>
      </main>
    </div>
  );
}
