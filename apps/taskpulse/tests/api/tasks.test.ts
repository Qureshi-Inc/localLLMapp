/*
 * @jest-environment node
 */
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the database module
jest.mock('@/lib/db', () => {
  const mockGetTasks = jest.fn(() => Promise.resolve([]));
  const mockCreateTask = jest.fn((task) => Promise.resolve({ id: '1', ...task, createdAt: new Date().toISOString() }));
  const mockUpdateTask = jest.fn((_id, _updates) => Promise.resolve({ id: '123', status: 'In Progress' }));
  const mockDeleteTask = jest.fn((_id) => Promise.resolve(true));

  return {
    getTasks: mockGetTasks,
    createTask: mockCreateTask,
    updateTask: mockUpdateTask,
    deleteTask: mockDeleteTask,
    __esModule: true,
  };
});

import { GET, POST } from '@/app/api/tasks/route';

let PATCH: typeof import('@/app/api/tasks/[id]/route')['PATCH'];
let DELETE: typeof import('@/app/api/tasks/[id]/route')['DELETE'];

beforeEach(async () => {
  // Re-import route handlers to get fresh mocks
  const mod = await import('@/app/api/tasks/[id]/route');
  PATCH = mod.PATCH;
  DELETE = mod.DELETE;
});

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return tasks', async () => {
      const response = await GET();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('POST /api/tasks', () => {
    it('should create a task with valid data', async () => {
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test Description',
          status: 'Todo',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.title).toBe('Test Task');
      expect(data.status).toBe('Todo');
    });

    it('should return 400 for missing fields', async () => {
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Task' }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    it('should update a task', async () => {
      const request = new Request('http://localhost/api/tasks/123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'In Progress' }),
      });
      const response = await PATCH(request, { params: { id: '123' } });
      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    it('should delete a task', async () => {
      const request = new Request('http://localhost/api/tasks/123', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { id: '123' } });
      expect(response.status).toBe(200);
    });
  });
});