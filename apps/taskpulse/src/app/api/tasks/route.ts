import { NextRequest, NextResponse } from 'next/server';
import { getTasks, createTask } from '@/lib/db';

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
type ValidPriority = typeof VALID_PRIORITIES[number];

const VALID_STATUSES = ['Todo', 'In Progress', 'Done'];

function isOverdue(dueDate?: string | null): boolean {
  if (!dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(dueDate) < today;
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
    const pageSize = Math.min(100, Math.max(1, parseInt(url.searchParams.get('pageSize') || '10', 10)));
    const statusFilter = url.searchParams.get('status');
    const searchQuery = url.searchParams.get('search') || '';
    const dueDateFilter = url.searchParams.get('dueDate') || 'all';
    const sortBy = url.searchParams.get('sortBy') || 'createdAt';
    const sortOrder = url.searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const tasks = await getTasks();

    let filtered = [...tasks];

    if (statusFilter && VALID_STATUSES.includes(statusFilter)) {
      filtered = filtered.filter(task => task.status === statusFilter);
    }

    if (dueDateFilter !== 'all') {
      if (dueDateFilter === 'overdue') {
        filtered = filtered.filter(task => isOverdue(task.dueDate));
      } else if (dueDateFilter === 'no-date') {
        filtered = filtered.filter(task => !task.dueDate);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(q) ||
        task.description.toLowerCase().includes(q)
      );
    }

    filtered.sort((sa: typeof tasks[0], sb: typeof tasks[0]) => {
      if (sortBy === 'dueDate') {
        const saOverdue = isOverdue(sa.dueDate) ? 1 : 0;
        const sbOverdue = isOverdue(sb.dueDate) ? 1 : 0;
        if (saOverdue !== sbOverdue) return (sbOverdue - saOverdue) * sortOrder;
        if (!sa.dueDate && !sb.dueDate) return 0;
        if (!sa.dueDate) return 1 * sortOrder;
        if (!sb.dueDate) return -1 * sortOrder;
        return (new Date(sa.dueDate).getTime() - new Date(sb.dueDate).getTime()) * sortOrder;
      }
      if (sortBy === 'priority') {
        const priOrder: Record<string, number> = { Urgent: 0, High: 1, Medium: 2, Low: 3 };
        const aPri = priOrder[sa.priority] !== undefined ? priOrder[sa.priority] : 2;
        const bPri = priOrder[sb.priority] !== undefined ? priOrder[sb.priority] : 2;
        const diff = aPri - bPri;
        return diff * sortOrder;
      }
      return (new Date(sa.createdAt).getTime() - new Date(sb.createdAt).getTime()) * sortOrder;
    });

    const totalItems = filtered.length;
    const totalPages = Math.ceil(totalItems / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;
    const paginatedTasks = filtered.slice(startIndex, startIndex + pageSize);

    return NextResponse.json({
      tasks: paginatedTasks,
      pagination: {
        currentPage: page,
        pageSize,
        totalItems,
        totalPages,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, status, priority: rawPriority, dueDate } = body;

    if (!title || !description || !status) {
      return NextResponse.json({ error: 'Missing required fields: title, description, status' }, { status: 400 });
    }

    if (title.length > 200) {
      return NextResponse.json({ error: 'Title must be at most 200 characters' }, { status: 400 });
    }

    if (dueDate && isNaN(new Date(dueDate).getTime())) {
      return NextResponse.json({ error: 'Invalid due date format' }, { status: 400 });
    }

    const validStatuses = ['Todo', 'In Progress', 'Done'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` }, { status: 400 });
    }

    const priority = (VALID_PRIORITIES.includes(rawPriority) ? rawPriority : 'Medium') as ValidPriority;

    const task = await createTask({ title, description, status, priority, dueDate: dueDate || null });
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
