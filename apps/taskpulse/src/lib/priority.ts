// Shared task types and priority metadata.
// Keep this module free of Node-only imports (fs, path, ...) so client
// components can import it without pulling the filesystem layer into the
// browser bundle. Persistence lives in ./db.
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: Priority;
  createdAt: string;
  dueDate: string | null;
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  'Urgent': 0,
  'High': 1,
  'Medium': 2,
  'Low': 3,
};

export const PRIORITY_CONFIG: Record<Priority, { dot: string; badge: string; text: string; ring: string }> = {
  'Urgent': { dot: 'bg-red-500', badge: 'bg-red-100', text: 'text-red-700', ring: 'ring-red-600/20' },
  'High': { dot: 'bg-orange-500', badge: 'bg-orange-100', text: 'text-orange-700', ring: 'ring-orange-600/20' },
  'Medium': { dot: 'bg-yellow-500', badge: 'bg-warning-100', text: 'text-warning-700', ring: 'ring-warning-600/20' },
  'Low': { dot: 'bg-surface-400', badge: 'bg-surface-100', text: 'text-surface-600', ring: 'ring-surface-500/20' },
};

export function getPriorityOrder(p: Priority): number {
  return PRIORITY_ORDER[p] ?? PRIORITY_ORDER['Medium'];
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  return sortTasksByPriorityAndDueDate([...tasks]);
}

export function sortTasksByPriorityAndDueDate(tasks: Task[]): Task[] {
  return tasks.sort((a, b) => {
    const priorityDiff = getPriorityOrder(a.priority as Priority) - getPriorityOrder(b.priority as Priority);
    if (priorityDiff !== 0) return priorityDiff;
    const dueDateCompare = compareDueDate(a.dueDate, b.dueDate);
    if (dueDateCompare !== 0) return dueDateCompare;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

function compareDueDate(dueA: string | null, dueB: string | null): number {
  const isOverdueA = isOverdue(dueA);
  const isOverdueB = isOverdue(dueB);
  if (isOverdueA && !isOverdueB) return -1;
  if (!isOverdueA && isOverdueB) return 1;
  if (!dueA && !dueB) return 0;
  if (!dueA) return 1;
  if (!dueB) return -1;
  return new Date(dueA).getTime() - new Date(dueB).getTime();
}

export function isOverdue(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return due < today;
}

export function getDueDateStatus(dueDate: string | null): 'overdue' | 'today' | 'due-soon' | 'none' {
  if (!dueDate) return 'none';
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return 'overdue';
  if (diffDays === 0) return 'today';
  if (diffDays <= 3) return 'due-soon';
  return 'none';
}

export function formatDateDisplay(dueDate: string | null): string {
  if (!dueDate) return '';
  const date = new Date(dueDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}
