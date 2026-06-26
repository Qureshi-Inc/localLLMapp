import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-indigo-600">TaskPulse</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        <Link href="/dashboard" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">Dashboard</Link>
        <Link href="/tasks" className="block px-4 py-2 rounded-lg text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition">All Tasks</Link>
      </nav>
    </aside>
  );
}