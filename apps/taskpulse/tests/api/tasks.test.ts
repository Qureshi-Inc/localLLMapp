import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { GET, POST } from '@/app/api/tasks/route';
import { PATCH, DELETE } from '@/app/api/tasks/[id]/route';

// Mock the database module
jest.mock('@/lib/db', () => ({
  getTasks: jest.fn(() => Promise.resolve([])),
  createTask: jest.fn((task) => Promise.resolve({ id: '1', ...task, createdAt: new Date().toISOString() })),
  updateTask: jest.fn(() => Promise.resolve({ id: '123', status: 'In Progress' })),
  deleteTask: jest.fn(() => Promise.resolve(true)),
}));

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