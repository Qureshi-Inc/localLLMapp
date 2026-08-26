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
  return [...tasks].sort((a, b) => {
    const priorityDiff = getPriorityOrder(a.priority as Priority) - getPriorityOrder(b.priority as Priority);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
