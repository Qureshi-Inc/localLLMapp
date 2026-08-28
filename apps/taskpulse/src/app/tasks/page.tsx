'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import TaskForm from '@/components/TaskForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Priority } from '@/lib/priority';
import { PRIORITY_CONFIG } from '@/lib/priority';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: Priority;
  createdAt: string;
}

const STATUS_CYCLE: Record<string, string> = {
  'Todo': 'In Progress',
  'In Progress': 'Done',
  'Done': 'Todo',
};

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    'Done': 'bg-success-100 text-success-700 ring-success-600/20',
    'In Progress': 'bg-warning-100 text-warning-700 ring-warning-600/20',
    'Todo': 'bg-surface-100 text-surface-600 ring-surface-500/20',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[status] || styles['Todo']}`}
    >
      {status === 'In Progress' && (
        <svg className="-ml-0.5 mr-1.5 h-1.5 w-1.5 text-warning-600 animate-pulse" fill="currentColor" viewBox="0 0 8 8">
          <circle cx="4" cy="4" r="3" />
        </svg>
      )}
      {status}
    </span>
  );
};

const SkeletonTableRows = () => (
  <div className="divide-y divide-surface-100">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="py-3.5 px-4 flex items-center gap-4 animate-pulse">
        <div className="w-20 h-4 bg-surface-200 rounded" />
        <div className="flex-1">
          <div className="w-48 h-4 bg-surface-200 rounded mb-1" />
          <div className="w-72 h-3 bg-surface-100 rounded" />
        </div>
        <div className="w-16 h-6 bg-surface-200 rounded-full" />
        <div className="w-20 h-4 bg-surface-200 rounded hidden sm:block" />
        <div className="w-48 h-4 bg-surface-200 rounded hidden"/>
      </div>
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4">
    <svg className="w-16 h-16 text-surface-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
    </svg>
    <h3 className="text-lg font-medium text-surface-900 mb-1">No tasks yet</h3>
    <p className="text-sm text-muted">Get started by creating your first task above.</p>
  </div>
);

const NotFoundState = () => (
  <div className="text-center py-16 px-4">
    <svg className="w-16 h-16 text-surface-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
    <h3 className="text-lg font-medium text-surface-900 mb-1">No tasks found</h3>
    <p className="text-sm text-muted">Try adjusting your search or filter to find what you&apos;re looking for.</p>
  </div>
);

function debounce(fn: (...args: string[]) => void, delay: number) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: string[]) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [deleteDialog, setDeleteDialog] = useState<{ isOpen: boolean; taskId: string | null; taskTitle: string }>({
    isOpen: false,
    taskId: null,
    taskTitle: '',
  });

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

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (task: { title: string; description: string; status: 'Todo' | 'In Progress' | 'Done'; priority: Priority }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error('Failed to create task');
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
    }
  };

  const handleUpdate = async (task: { title: string; description: string; status: 'Todo' | 'In Progress' | 'Done'; priority: Priority }) => {
    if (!editingTask) return;
    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(task),
      });
      if (!res.ok) throw new Error('Failed to update task');
      setEditingTask(null);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.taskId) return;
    try {
      const res = await fetch(`/api/tasks/${deleteDialog.taskId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(prev => prev.filter(t => t.id !== deleteDialog.taskId));
      if (editingTask?.id === deleteDialog.taskId) {
        setEditingTask(null);
      }
      setDeleteDialog({ isOpen: false, taskId: null, taskTitle: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  const handleDeleteCancel = useCallback(() => {
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

  const clearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('All');
  }, []);

  const debouncedSearch = useCallback(debounce((value: string) => {
    setSearch(value);
  }, 300), []);

  const filteredTasks = tasks.filter(task => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const searchLower = search.toLowerCase();
    const matchesSearch = !search ||
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower);
    return matchesStatus && matchesSearch;
  });

  const hasActiveFilters = search.length > 0 || statusFilter !== 'All';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-32 h-7 bg-surface-200 rounded animate-pulse" />
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <SkeletonTableRows />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Tasks</h1>
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-danger-50 border border-danger-200 text-danger-700 px-4 py-3 rounded-lg text-sm">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          {error}
        </div>
      )}

      {editingTask ? (
        <TaskForm
          onSubmit={handleUpdate}
          initialData={editingTask}
          onCancel={() => setEditingTask(null)}
        />
      ) : (
        <TaskForm onSubmit={handleCreate} />
      )}

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white rounded-xl border border-surface-200 shadow-sm p-3">
        <div className="relative flex-1 w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors"
          />
          {search && (
            <button
              onClick={() => { setSearch(''); if (statusFilter === 'All') clearFilters(); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted hover:text-surface-700"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-surface-200 bg-surface-50 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer"
        >
          <option value="All">All Status</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-muted hover:text-primary transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          tasks.length === 0 ? <EmptyState /> : <NotFoundState />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th scope="col" className="text-left py-3.5 px-4 font-semibold text-surface-700 min-w-[200px]">
                    Priority
                  </th>
                  <th scope="col" className="text-left py-3.5 px-4 font-semibold text-surface-700 min-w-[200px]">
                    Task
                  </th>
                  <th scope="col" className="text-left py-3.5 px-4 font-semibold text-surface-700 min-w-[140px]">
                    Status
                  </th>
                  <th scope="col" className="text-left py-3.5 px-4 font-semibold text-surface-700 min-w-[130px] hidden sm:table-cell">
                    Created
                  </th>
                  <th scope="col" className="text-right py-3.5 px-4 font-semibold text-surface-700 min-w-[180px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {filteredTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="group transition-colors hover:bg-primary-50/50"
                  >
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        PRIORITY_CONFIG[task.priority as Priority]?.badge || PRIORITY_CONFIG['Medium'].badge
                      } ${PRIORITY_CONFIG[task.priority as Priority]?.text || PRIORITY_CONFIG['Medium'].text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          PRIORITY_CONFIG[task.priority as Priority]?.dot || PRIORITY_CONFIG['Medium'].dot
                        }`} />
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <p className="font-medium text-surface-900 truncate">{task.title}</p>
                        <p className="text-muted text-xs mt-0.5 truncate max-w-md">{task.description}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3.5 px-4 text-surface-600 hidden sm:table-cell">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleToggleStatus(task.id, task.status)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-success-700 bg-success-50 hover:bg-success-100 border border-success-200/60 hover:border-success-300 transition-colors"
                          title={task.status === 'Done' ? 'Reopen task' : 'Mark as complete'}
                        >
                          {task.status === 'Done' ? (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                              </svg>
                              Reopen
                            </>
                          ) : (
                            <>
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Complete
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingTask(task)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-primary-700 bg-primary-50 hover:bg-primary-100 border border-primary-200/60 hover:border-primary-300 transition-colors"
                          title="Edit task"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteDialog({ isOpen: true, taskId: task.id, taskTitle: task.title })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md text-danger-700 bg-danger-50 hover:bg-danger-100 border border-danger-200/60 hover:border-danger-300 transition-colors focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-danger-500 focus:ring-offset-2"
                          title="Delete task"
                          aria-label={`Delete task: ${task.title}`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteDialog.isOpen}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteDialog.taskTitle}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
      />
    </div>
  );
}
