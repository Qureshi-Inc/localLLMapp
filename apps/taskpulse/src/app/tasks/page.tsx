'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import TaskForm from '@/components/TaskForm';
import ConfirmDialog from '@/components/ConfirmDialog';
import type { Priority } from '@/lib/priority';
import { PRIORITY_CONFIG, PRIORITY_ORDER, getDueDateStatus, isOverdue, formatDateDisplay } from '@/lib/priority';
import { ToastProvider, useToast } from '@/components/Toast';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string;
  dueDate: string | null;
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

const PRIORITY_CONFIG_DISPLAY = {
  'Low': { dot: 'bg-surface-400', badge: 'bg-surface-100', text: 'text-surface-600' },
  'Medium': { dot: 'bg-warning-500', badge: 'bg-warning-100', text: 'text-warning-700' },
  'High': { dot: 'bg-orange-500', badge: 'bg-orange-100', text: 'text-orange-700' },
  'Urgent': { dot: 'bg-red-500', badge: 'bg-red-100', text: 'text-red-700' },
};

const SkeletonTableRows = () => (
  <div className="divide-y divide-surface-100 dark:divide-surface-700">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="py-3.5 px-4 flex items-center gap-4 animate-pulse">
        <div className="w-20 h-4 bg-surface-200 dark:bg-surface-700 rounded" />
        <div className="flex-1">
          <div className="w-48 h-4 bg-surface-200 dark:bg-surface-700 rounded mb-1" />
          <div className="w-72 h-3 bg-surface-100 dark:bg-surface-800 rounded" />
        </div>
        <div className="w-16 h-6 bg-surface-200 dark:bg-surface-700 rounded-full" />
        <div className="w-20 h-4 bg-surface-200 dark:bg-surface-700 rounded hidden sm:block" />
        <div className="w-48 h-4 bg-surface-200 dark:bg-surface-700 rounded hidden"/>
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function isDueSoon(dateStr?: string): boolean {
  if (!dateStr) return false;
  const due = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
  return diff > 0 && diff <= 3;
}

function TasksPageContent() {
  const { addToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dueDateFilter, setDueDateFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPageLoading, setIsPageLoading] = useState(false);
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
      setCurrentPage(1);
    } catch {
      console.error('Failed to fetch tasks');
      addToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleCreate = async (task: { title: string; description: string; status: 'Todo' | 'In Progress' | 'Done'; priority: Priority; dueDate: string | null }) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate }),
      });
      if (!res.ok) throw new Error('Failed to create task');
      await fetchTasks();
      addToast('Task created successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      addToast(err instanceof Error ? err.message : 'Failed to create task', 'error');
    }
  };

  const handleUpdate = async (task: { title: string; description: string; status: 'Todo' | 'In Progress' | 'Done'; priority: Priority; dueDate: string | null }) => {
    if (!editingTask) return;
    try {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: task.title, description: task.description, status: task.status, priority: task.priority, dueDate: task.dueDate }),
      });
      if (!res.ok) throw new Error('Failed to update task');
      setEditingTask(null);
      await fetchTasks();
      addToast('Task updated successfully', 'success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      addToast(err instanceof Error ? err.message : 'Failed to update task', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete task');
      setTasks(prev => prev.filter(t => t.id !== id));
      addToast('Task deleted', 'info');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      addToast(err instanceof Error ? err.message : 'Failed to delete task', 'error');
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
      addToast('Task deleted', 'info');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      addToast(err instanceof Error ? err.message : 'Failed to delete task', 'error');
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
      addToast(err instanceof Error ? err.message : 'Failed to update status', 'error');
    }
  };

  const clearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('All');
    setDueDateFilter('all');
  }, []);

  const debouncedSearch = useCallback((function () {
    let timer: ReturnType<typeof setTimeout>;
    return (value: string) => {
      clearTimeout(timer);
      timer = setTimeout(() => setSearch(value), 300);
    };
  })(), []);

  const filteredTasks = [...tasks].filter(task => {
    const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
    const matchesDueDate = dueDateFilter === 'all' ||
      (dueDateFilter === 'overdue' && isOverdue(task.dueDate)) ||
      (dueDateFilter === 'no-date' && !task.dueDate);
    const searchLower = search.toLowerCase();
    const matchesSearch = !search ||
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower);
    return matchesStatus && matchesDueDate && matchesSearch;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const aOverdue = isOverdue(a.dueDate) ? 1 : 0;
    const bOverdue = isOverdue(b.dueDate) ? 1 : 0;
    if (bOverdue !== aOverdue) return bOverdue - aOverdue;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const totalPages = sortedTasks.length > 0 ? Math.ceil(sortedTasks.length / pageSize) : 1;
  const paginatedTasks = sortedTasks.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setIsPageLoading(true);
    setCurrentPage(page);
    setTimeout(() => setIsPageLoading(false), 200);
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const hasActiveFilters = search.length > 0 || statusFilter !== 'All' || dueDateFilter !== 'all';
  const currentPageData = sortedTasks.length > 0
    ? `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, sortedTasks.length)} of ${sortedTasks.length}`
    : '';

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="w-32 h-7 bg-surface-200 rounded animate-pulse" />
        <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm overflow-hidden">
          <SkeletonTableRows />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">Tasks</h1>
        {filteredTasks.length > 0 && (
          <span className="text-sm text-muted">{currentPageData}</span>
        )}
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm p-3">
        <div className="relative flex-1 w-full">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => debouncedSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors dark:text-surface-100"
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
            className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer dark:text-surface-100"
          >
            <option value="All">All Status</option>
            <option value="Todo">Todo</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          <select
            value={dueDateFilter}
            onChange={(e) => setDueDateFilter(e.target.value)}
            className="px-3 py-2 text-sm rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer dark:text-surface-100"
          >
            <option value="all">Any Due Date</option>
            <option value="overdue">Overdue</option>
            <option value="no-date">No Due Date</option>
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
                <tr className="bg-surface-50 dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700">
                  <th scope="col" className="text-left py-3.5 px-4 font-semibold text-surface-700 dark:text-surface-300 min-w-[200px]">
                    Priority
                  </th>
                  <th scope="col" className="text-left py-3.5 px-4 font-semibold text-surface-700 dark:text-surface-300 min-w-[200px]">
                    Task
                  </th>
                  <th scope="col" className="text-left py-3.5 px-4 font-semibold text-surface-700 dark:text-surface-300 min-w-[140px]">
                    Status
                  </th>
                  <th scope="col" className="text-left py-3.5 px-4 font-semibold text-surface-700 dark:text-surface-300 min-w-[130px] hidden sm:table-cell">
                    Created
                  </th>
                  <th scope="col" className="text-left py-3.5 px-4 font-semibold text-surface-700 dark:text-surface-300 min-w-[120px] hidden md:table-cell">
                    Due Date
                  </th>
                  <th scope="col" className="text-right py-3.5 px-4 font-semibold text-surface-700 dark:text-surface-300 min-w-[180px]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-surface-100 dark:divide-surface-700 ${isPageLoading ? 'animate-pulse' : ''}`}>
                {paginatedTasks.map((task) => (
                  <tr
                    key={task.id}
                    className="group transition-colors hover:bg-primary-50/50 dark:hover:bg-primary-900/20"
                  >
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                        PRIORITY_CONFIG_DISPLAY[task.priority as keyof typeof PRIORITY_CONFIG_DISPLAY]?.badge || PRIORITY_CONFIG_DISPLAY['Medium'].badge
                      } ${PRIORITY_CONFIG_DISPLAY[task.priority as keyof typeof PRIORITY_CONFIG_DISPLAY]?.text || PRIORITY_CONFIG_DISPLAY['Medium'].text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          PRIORITY_CONFIG_DISPLAY[task.priority as keyof typeof PRIORITY_CONFIG_DISPLAY]?.dot || PRIORITY_CONFIG_DISPLAY['Medium'].dot
                        }`} />
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {task.dueDate ? (
                        <span className={`text-sm ${
                          isOverdue(task.dueDate) ? 'text-danger-600 font-medium' :
                          isDueSoon(task.dueDate) ? 'text-warning-600 font-medium' :
                          'text-surface-600'
                        }`}>
                          {isOverdue(task.dueDate) && <span className="mr-0.5">⚠</span>}
                          {isDueSoon(task.dueDate) && !isOverdue(task.dueDate) && <span className="mr-0.5">⏰</span>}
                          {formatDate(task.dueDate)}
                        </span>
                      ) : (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="min-w-0">
                        <p className="font-medium text-surface-900 dark:text-surface-100 truncate">{task.title}</p>
                        <p className="text-muted text-xs mt-0.5 truncate max-w-md dark:text-surface-500">{task.description}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="py-3.5 px-4 text-surface-600 dark:text-surface-400 hidden sm:table-cell">
                      {new Date(task.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell">
                      {task.dueDate ? (() => {
                        const dueStatus = getDueDateStatus(task.dueDate);
                        if (dueStatus === 'overdue') {
                          return (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-danger-600 dark:text-danger-400">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDateDisplay(task.dueDate)}
                            </span>
                          );
                        }
                        if (dueStatus === 'today') {
                          return (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-warning-600 dark:text-warning-400">
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatDateDisplay(task.dueDate)}
                            </span>
                          );
                        }
                        if (dueStatus === 'due-soon') {
                          return (
                            <span className="inline-flex items-center gap-1 text-xs font-medium text-yellow-600 dark:text-yellow-400">
                              {formatDateDisplay(task.dueDate)}
                            </span>
                          );
                        }
                        return (
                          <span className="text-xs text-muted dark:text-surface-500">
                            {formatDateDisplay(task.dueDate)}
                          </span>
                        );
                      })() : (
                        <span className="text-xs text-muted dark:text-surface-600">—</span>
                      )}
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-muted dark:text-surface-400">
            <span>Showing</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer dark:text-surface-100"
              aria-label="Items per page"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>of {sortedTasks.length} tasks</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="First page"
              title="First page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Previous page"
              title="Previous page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(page => page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1)
              .reduce<number[]>((acc, page, idx, arr) => {
                if (idx > 0 && page - arr[idx - 1] > 1) acc.push(-1);
                acc.push(page);
                return acc;
              }, [])
              .map((page, idx) => page === -1 ? (
                <span key={`ellipsis-${idx}`} className="px-2 text-muted dark:text-surface-500">...</span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800'
                  }`}
                  aria-label={`Page ${page}`}
                  aria-current={currentPage === page ? 'page' : undefined}
                >
                  {page}
                </button>
              ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Next page"
              title="Next page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage >= totalPages}
              className="p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              aria-label="Last page"
              title="Last page"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}

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

export default function TasksPage() {
  return (
    <ToastProvider>
      <TasksPageContent />
    </ToastProvider>
  );
}
