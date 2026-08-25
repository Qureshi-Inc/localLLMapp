import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'tasks.json');

export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

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

export async function sortTasksByPriority(tasks: Task[]): Promise<Task[]> {
  return [...tasks].sort((a, b) => {
    const priorityDiff = getPriorityOrder(a.priority as Priority) - getPriorityOrder(b.priority as Priority);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: Priority;
  createdAt: string;
}

// Migration note: existing data in data/tasks.json does not include priority.
// On first write, missing priority fields default to 'Medium' in TaskForm.
// Manually migrate existing tasks: run once, then delete this script.

function readTasks(): Task[] {
  if (!fs.existsSync(DB_PATH)) {
    return [];
  }
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeTasks(tasks: Task[]): void {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(DB_PATH, JSON.stringify(tasks, null, 2));
}

export async function getTasks(): Promise<Task[]> {
  return readTasks();
}

export async function createTask(task: Omit<Task, 'id' | 'createdAt'>): Promise<Task> {
  const tasks = readTasks();
  const newTask: Task = {
    ...task,
    id: crypto.randomUUID(),
    priority: (task as Partial<Task>).priority || 'Medium',
    createdAt: new Date().toISOString(),
  };
  tasks.push(newTask);
  writeTasks(tasks);
  return newTask;
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return null;
  tasks[index] = { ...tasks[index], ...updates };
  writeTasks(tasks);
  return tasks[index];
}

export async function deleteTask(id: string): Promise<boolean> {
  const tasks = readTasks();
  const index = tasks.findIndex(t => t.id === id);
  if (index === -1) return false;
  tasks.splice(index, 1);
  writeTasks(tasks);
  return true;
}