'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-2xl font-bold text-indigo-600">TaskPulse</Link>
      <div className="flex gap-6">
        <Link href="/" className="text-gray-600 hover:text-indigo-600 transition">Home</Link>
        <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition">Dashboard</Link>
        <Link href="/tasks" className="text-gray-600 hover:text-indigo-600 transition">Tasks</Link>
      </div>
    </nav>
  );
}