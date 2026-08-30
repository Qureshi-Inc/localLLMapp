// Server-only persistence layer. Do not import this from a client component —
// it pulls in fs. Client components should import types and priority metadata
// from ./priority instead.
import fs from 'fs';
import path from 'path';

import type { Task } from './priority';

export type { Priority, Task } from './priority';
export { PRIORITY_ORDER, PRIORITY_CONFIG, getPriorityOrder, sortTasksByPriority } from './priority';

const DB_PATH = path.join(process.cwd(), 'data', 'tasks.json');

let writeQueue: Promise<void> = Promise.resolve();

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
  let lastResolve: () => void;
  const nextWrite = new Promise<void>(resolve => { lastResolve = resolve; });
  const current = writeQueue.then(() => nextWrite);
  writeQueue = nextWrite.then(() => current);
  try {
    const tasks = readTasks();
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      priority: (task as Partial<Task>).priority || 'Medium',
      dueDate: (task as Partial<Task>).dueDate || null,
      createdAt: new Date().toISOString(),
    };
    tasks.push(newTask);
    writeTasks(tasks);
    return newTask;
  } catch {
    throw new Error('Failed to create task: disk write error');
  } finally {
    lastResolve!();
  }
}

export async function updateTask(id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>): Promise<Task | null> {
  let lastResolve: () => void;
  const nextWrite = new Promise<void>(resolve => { lastResolve = resolve; });
  const current = writeQueue.then(() => nextWrite);
  writeQueue = nextWrite.then(() => current);
  try {
    const tasks = readTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return null;
    tasks[index] = { ...tasks[index], ...updates };
    writeTasks(tasks);
    return tasks[index];
  } catch {
    throw new Error('Failed to update task: disk write error');
  } finally {
    lastResolve!();
  }
}

export async function deleteTask(id: string): Promise<boolean> {
  let lastResolve: () => void;
  const nextWrite = new Promise<void>(resolve => { lastResolve = resolve; });
  const current = writeQueue.then(() => nextWrite);
  writeQueue = nextWrite.then(() => current);
  try {
    const tasks = readTasks();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return false;
    tasks.splice(index, 1);
    writeTasks(tasks);
    return true;
  } catch {
    throw new Error('Failed to delete task: disk write error');
  } finally {
    lastResolve!();
  }
}
