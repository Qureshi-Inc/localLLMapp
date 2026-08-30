'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { Priority } from '@/lib/priority';
import { PRIORITY_CONFIG, isOverdue, formatDateDisplay } from '@/lib/priority';
import ConfirmDialog from '@/components/ConfirmDialog';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: Priority;
  createdAt: string;
  dueDate: string | null;
}

const STATUS_CYCLE: Record<string, string> = {
  'Todo': 'In Progress',
  'In Progress': 'Done',
  'Done': 'Todo',
};

const statusConfig: Record<string, { color: string; bg: string; bgHover: string; icon: React.ReactNode }> = {
  'Todo': {
    color: 'text-surface-600',
    bg: 'bg-surface-100',
    bgHover: 'hover:bg-surface-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  'In Progress': {
    color: 'text-warning-600',
    bg: 'bg-warning-100',
    bgHover: 'hover:bg-warning-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  'Done': {
    color: 'text-success-600',
    bg: 'bg-success-100',
    bgHover: 'hover:bg-success-200',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const last7Days = dayLabels.slice(-7);

function computeActivityData(tasks: Task[]): { label: string; value: number }[] {
  const counts = last7Days.map(() => 0);
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dayLabel = dayLabels[d.getDay()];
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    tasks.forEach(task => {
      if (task.createdAt.startsWith(dateStr)) {
        counts[6 - i]++;
      }
    });
  }
  return last7Days.map((label, i) => ({ label, value: counts[i] }));
}

interface StatCardProps {
  label: string;
  value: number;
  total: number;
  config: { color: string; bg: string; bgHover: string; icon: React.ReactNode };
  href: string;
}

function StatCard({ label, value, total, config, href }: StatCardProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
      <Link
        href={href}
        className={`group bg-white dark:bg-surface-900 rounded-xl border border-border dark:border-surface-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden ${config.bgHover}`}
      >
      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <span className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${config.bg} ${config.color}`}>
            {config.icon}
          </span>
          <span className="text-xs font-medium text-muted">{percentage}% of total</span>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted uppercase tracking-wide">{label}</h3>
          <p className="mt-1 text-3xl sm:text-4xl font-bold text-surface-900 tabular-nums">{value}</p>
        </div>
        <div className="mt-4">
          <div className="w-full bg-surface-100 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                label === 'Todo' ? 'bg-surface-500' :
                label === 'In Progress' ? 'bg-warning-500' :
                'bg-success-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}

function ChartPlaceholder({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-surface-900 rounded-xl border border-border dark:border-surface-700 shadow-sm p-5 sm:p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold text-surface-900">{title}</h3>
          <p className="text-sm text-muted mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
          <span>This week</span>
        </div>
      </div>
      {children}
    </div>
  );
}

function BarChart({ tasks }: { tasks: Task[] }) {
  const activityData = computeActivityData(tasks);
  const maxVal = Math.max(...activityData.map(d => d.value), 1);

  return (
    <div className="flex items-end gap-2 sm:gap-3 h-48">
      {activityData.map((item, index) => {
        const heightPercent = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
        return (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full relative flex items-end justify-center" style={{ height: '160px' }}>
              <div
                className="w-full sm:w-3/4 bg-primary rounded-t-md transition-all duration-700 ease-out hover:bg-primary-600"
                style={{ height: `${heightPercent}%`, minHeight: heightPercent > 0 ? '8px' : '0' }}
              />
            </div>
            <span className="text-xs text-muted font-medium">{item.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function DonutChart({ tasks }: { tasks: Task[] }) {
  const total = tasks.length;
  const completed = tasks.filter(t => t.status === 'Done').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const todo = tasks.filter(t => t.status === 'Todo').length;

  const completedPct = total > 0 ? (completed / total) * 100 : 0;
  const inProgressPct = total > 0 ? (inProgress / total) * 100 : 0;
  const todoPct = total > 0 ? (todo / total) * 100 : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative w-36 h-36 flex-shrink-0">
        <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e4e4e7" strokeWidth="3" />
          {total > 0 && (
            <>
              <circle
                cx="18" cy="18" r="15.915" fill="none"
                stroke="#10b981" strokeWidth="3"
                strokeDasharray={`${completedPct} ${100 - completedPct}`}
                strokeDashoffset="0"
                strokeLinecap="round"
              />
              <circle
                cx="18" cy="18" r="15.915" fill="none"
                stroke="#f59e0b" strokeWidth="3"
                strokeDasharray={`${inProgressPct} ${100 - inProgressPct}`}
                strokeDashoffset={`-${completedPct}`}
                strokeLinecap="round"
              />
              <circle
                cx="18" cy="18" r="15.915" fill="none"
                stroke="#71717a" strokeWidth="3"
                strokeDasharray={`${todoPct} ${100 - todoPct}`}
                strokeDashoffset={`-${completedPct + inProgressPct}`}
                strokeLinecap="round"
              />
            </>
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-surface-900">{total}</span>
          <span className="text-xs text-muted">Total</span>
        </div>
      </div>
        <div className="flex-1 space-y-3 w-full">
          {[
            { label: 'Completed', value: completed, color: 'bg-success-500', pct: completedPct },
            { label: 'In Progress', value: inProgress, color: 'bg-warning-500', pct: inProgressPct },
            { label: 'Todo', value: todo, color: 'bg-surface-500', pct: todoPct },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                  <span className="text-surface-700 dark:text-surface-300 font-medium">{item.label}</span>
                </div>
                <span className="text-surface-900 dark:text-surface-100 font-semibold">{item.value}</span>
              </div>
              <div className="w-full bg-surface-100 dark:bg-surface-700 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full ${item.color}`}
                style={{ width: `${item.pct}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityItem({ task }: { task: Task }) {
  const statusBadge = (status: string) => {
    switch (status) {
      case 'Done':
        return 'bg-success-100 text-success-700';
      case 'In Progress':
        return 'bg-warning-100 text-warning-700';
      default:
        return 'bg-surface-100 text-surface-700';
    }
  };

  return (
    <div className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
        task.status === 'Done' ? 'bg-success-500' :
        task.status === 'In Progress' ? 'bg-warning-500' :
        'bg-surface-400'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-surface-900 truncate">{task.title}</p>
        <p className="text-xs text-muted truncate">{task.description}</p>
      </div>
      <span className={`hidden sm:inline-block text-xs px-2.5 py-1 rounded-full font-medium flex-shrink-0 ${statusBadge(task.status)}`}>
        {task.status}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; taskId: string | null; taskTitle: string }>({
    isOpen: false,
    taskId: null,
    taskTitle: '',
  });

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
  const totalTasks = tasks.length;

  const handleDelete = useCallback((task: Task) => {
    setDeleteDialog({ isOpen: true, taskId: task.id, taskTitle: task.title });
  }, []);

  const handleConfirmDelete = async () => {
    if (!deleteDialog.taskId) return;
    try {
      const res = await fetch(`/api/tasks/${deleteDialog.taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(prev => prev.filter(t => t.id !== deleteDialog.taskId));
      setDeleteDialog({ isOpen: false, taskId: null, taskTitle: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleCancelDelete = useCallback(() => {
    setDeleteDialog({ isOpen: false, taskId: null, taskTitle: '' });
  }, []);

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
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white rounded-xl border border-border shadow-sm p-5 sm:p-6 animate-pulse">
              <div className="w-10 h-10 bg-surface-200 rounded-lg mb-4" />
              <div className="w-20 h-4 bg-surface-200 rounded mb-2" />
              <div className="w-16 h-8 bg-surface-200 rounded mb-4" />
              <div className="w-full h-2 bg-surface-200 rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 sm:p-6 animate-pulse">
            <div className="w-40 h-5 bg-surface-200 rounded mb-6" />
            <div className="flex items-end gap-3 h-48">
              {[0.65, 0.85, 0.45, 0.9, 0.7, 0.35, 0.2].map((h, i) => (
                <div key={i} className="flex-1 bg-surface-200 rounded-t-md" style={{ height: `${h * 160}px` }} />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-border shadow-sm p-5 sm:p-6 animate-pulse">
            <div className="w-40 h-5 bg-surface-200 rounded mb-6" />
            <div className="flex items-center gap-6">
              <div className="w-36 h-36 rounded-full bg-surface-200" />
              <div className="flex-1 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-full h-4 bg-surface-200 rounded" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const recentTasks = [...tasks].sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-surface-900">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Overview of your tasks and productivity</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/tasks"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-600 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Link>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-danger-50 dark:bg-danger-900/20 border border-danger-200 dark:border-danger-800 rounded-lg text-danger-700 dark:text-danger-400 text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <StatCard
          label="Todo"
          value={todoCount}
          total={totalTasks}
          config={statusConfig['Todo']}
          href="/tasks?status=Todo"
        />
        <StatCard
          label="In Progress"
          value={inProgressCount}
          total={totalTasks}
          config={statusConfig['In Progress']}
          href="/tasks?status=In Progress"
        />
        <StatCard
          label="Done"
          value={doneCount}
          total={totalTasks}
          config={statusConfig['Done']}
          href="/tasks?status=Done"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <ChartPlaceholder
          title="Weekly Activity"
          subtitle="Tasks created per day this week"
        >
          <BarChart tasks={tasks} />
        </ChartPlaceholder>

        <ChartPlaceholder
          title="Task Distribution"
          subtitle="Breakdown by status"
        >
          <DonutChart tasks={tasks} />
        </ChartPlaceholder>
      </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-surface-900 rounded-xl border border-border dark:border-surface-700 shadow-sm">
          <div className="flex items-center justify-between p-5 sm:p-6 pb-0">
            <div>
              <h3 className="text-base font-semibold text-surface-900">Recent Tasks</h3>
              <p className="text-sm text-muted mt-1">Your most recently updated tasks</p>
            </div>
            <Link
              href="/tasks"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary-600 transition-colors"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="p-5 sm:p-6">
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 mx-auto text-surface-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <p className="text-sm text-muted">No tasks yet. Create your first task to get started!</p>
                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-primary hover:text-primary-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create Task
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border dark:divide-surface-700">
                {recentTasks.map((task) => (
                  <div key={task.id} className="group flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          PRIORITY_CONFIG[task.priority as Priority]?.dot || 'bg-yellow-500'
                        }`} title={`Priority: ${task.priority}`} />
                        <p className="text-sm font-medium text-surface-900 group-hover:text-primary transition-colors truncate">
                          {task.title}
                        </p>
                        {task.dueDate && (
                          <span className={`flex items-center gap-0.5 flex-shrink-0 text-xs ${
                            isOverdue(task.dueDate) ? 'text-danger-600 dark:text-danger-400' :
                            new Date(task.dueDate).toDateString() === new Date().toDateString() ? 'text-warning-600 dark:text-warning-400' :
                            (() => { const d = new Date(task.dueDate); const diff = Math.ceil((d.getTime() - new Date().setHours(0,0,0,0)) / 86400000); return diff <= 3 && diff > 0 ? 'text-yellow-600 dark:text-yellow-400' : 'text-muted dark:text-surface-500'; })()
                          }`}>
                            {formatDateDisplay(task.dueDate)}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted dark:text-surface-500 truncate">{task.description}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        task.status === 'Done' ? 'bg-success-100 text-success-700' :
                        task.status === 'In Progress' ? 'bg-warning-100 text-warning-700' :
                        'bg-surface-100 text-surface-700'
                      }`}>
                        {task.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/50 group-hover:bg-white inset-shadow-sm transition-colors">
                      <button
                        onClick={() => handleToggleStatus(task.id, task.status)}
                        className="p-1.5 rounded-md hover:bg-surface-100 text-muted hover:text-surface-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        title={task.status === 'Done' ? 'Reopen' : 'Complete'}
                      >
                        {task.status === 'Done' ? (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(task)}
                        className="p-1.5 rounded-md hover:bg-danger-50 text-muted hover:text-danger-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-500"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <ConfirmDialog
          isOpen={deleteDialog.isOpen}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          title="Delete Task"
          message={`Are you sure you want to delete "${deleteDialog.taskTitle}"? This action cannot be undone.`}
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />

        <div className="bg-white dark:bg-surface-900 rounded-xl border border-border dark:border-surface-700 shadow-sm">
          <div className="p-5 sm:p-6 pb-0">
            <h3 className="text-base font-semibold text-surface-900">Quick Stats</h3>
            <p className="text-sm text-muted mt-1">Summary overview</p>
          </div>
          <div className="p-5 sm:p-6">
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Total Tasks</span>
                <span className="text-lg font-bold text-surface-900">{totalTasks}</span>
              </div>
              <div className="h-px bg-border dark:bg-surface-700" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted dark:text-surface-500">Completion Rate</span>
                <span className="text-lg font-bold text-success-600 dark:text-success-400">
                  {totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0}%
                </span>
              </div>
              <div className="h-px bg-border dark:bg-surface-700" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted dark:text-surface-500">In Progress</span>
                <span className="text-lg font-bold text-warning-600 dark:text-warning-400">{inProgressCount}</span>
              </div>
              <div className="h-px bg-border dark:bg-surface-700" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted dark:text-surface-500">This Week</span>
                <span className="text-lg font-bold text-primary">
                  {computeActivityData(tasks).reduce((sum, d) => sum + d.value, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
