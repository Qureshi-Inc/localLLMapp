'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  createdAt: string;
}

const STATUS_CYCLE: Record<string, string> = {
  'Todo': 'In Progress',
  'In Progress': 'Done',
  'Done': 'Todo',
};

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks');
        if (!res.ok) throw new Error('Failed to fetch tasks');
        const data = await res.json();
        setTasks(data);
      } catch {
        console.error('Failed to fetch tasks');
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const todoCount = tasks.filter(t => t.status === 'Todo').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;
  const doneCount = tasks.filter(t => t.status === 'Done').length;

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = (STATUS_CYCLE[currentStatus] || 'Todo') as 'Todo' | 'In Progress' | 'Done';
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update task status');
      setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task status');
    }
  };

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Todo</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{todoCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{inProgressCount}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500">Done</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{doneCount}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <Link href="/tasks" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
          Manage Tasks
        </Link>
      </div>

      {tasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Tasks</h2>
          {tasks.slice(0, 5).map((task) => (
            <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                <span className={`inline-block mt-1 text-xs px-2 py-1 rounded-full ${
                  task.status === 'Done' ? 'bg-green-100 text-green-700' :
                  task.status === 'In Progress' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {task.status}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleToggleStatus(task.id, task.status)}
                  className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition"
                >
                  {task.status === 'Done' ? 'Reopen' : 'Complete'}
                </button>
                <button
                  onClick={() => handleDelete(task.id)}
                  className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
