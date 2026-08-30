import { NextResponse } from 'next/server';
import { updateTask, deleteTask } from '@/lib/db';

const ALLOWED_FIELDS = ['title', 'description', 'status', 'priority', 'dueDate'];
const VALID_PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'] as const;

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await request.json();

    const validatedUpdates: Record<string, string | null> = {};
    for (const key of ALLOWED_FIELDS) {
      if (key in body) {
        if (key === 'priority') {
          if (VALID_PRIORITIES.includes(body[key])) {
            validatedUpdates[key] = body[key];
          } else {
            return NextResponse.json({ error: `Invalid priority. Must be one of: ${VALID_PRIORITIES.join(', ')}` }, { status: 400 });
          }
        } else if (body[key] === null || body[key] === '') {
          validatedUpdates[key] = key === 'dueDate' ? null : String(body[key] ?? '');
        } else {
          validatedUpdates[key] = String(body[key]);
        }
      }
    }

    const task = await updateTask(id, validatedUpdates);
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;

    const deleted = await deleteTask(id);
    if (!deleted) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
