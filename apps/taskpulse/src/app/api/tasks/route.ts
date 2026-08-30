import { NextResponse } from 'next/server';
import { getTasks, createTask } from '@/lib/db';

const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;
type ValidPriority = typeof VALID_PRIORITIES[number];

export async function GET() {
  try {
    const tasks = await getTasks();
    return NextResponse.json(tasks);
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