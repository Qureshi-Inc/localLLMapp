import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock the database module before importing route handlers
const mockGetTasks = jest.fn(() => Promise.resolve([]));
const mockCreateTask = jest.fn((task) => Promise.resolve({ id: '1', ...task, createdAt: new Date().toISOString() }));
const mockUpdateTask = jest.fn(() => Promise.resolve({ id: '123', status: 'In Progress' }));
const mockDeleteTask = jest.fn(() => Promise.resolve(true));

jest.mock('@/lib/db', () => ({
  getTasks: mockGetTasks,
  createTask: mockCreateTask,
  updateTask: mockUpdateTask,
  deleteTask: mockDeleteTask,
}));

const { GET, POST } = require('@/app/api/tasks/route');
const { PATCH, DELETE } = require('@/app/api/tasks/[id]/route');

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/tasks', () => {
    it('should return tasks without pagination params', async () => {
      mockGetTasks.mockResolvedValueOnce([
        { id: '1', title: 'Task 1', description: 'Desc', status: 'Todo', priority: 'Medium', createdAt: '2024-01-01T00:00:00Z' },
      ]);
      const request = new Request('http://localhost/api/tasks');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tasks).toHaveLength(1);
      expect(data.pagination).toBeDefined();
      expect(data.pagination.totalItems).toBe(1);
      expect(data.pagination.totalPages).toBe(1);
      expect(data.pagination.pageSize).toBe(10);
    });

    it('should return paginated tasks', async () => {
      mockGetTasks.mockResolvedValueOnce(
        Array.from({ length: 25 }, (_, i) => ({
          id: String(i),
          title: `Task ${i}`,
          description: `Desc ${i}`,
          status: 'Todo',
          priority: 'Medium',
          createdAt: `2024-01-0${i % 9 + 1}T00:00:00Z`,
        }))
      );
      const request = new Request('http://localhost/api/tasks?page=1&pageSize=10');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tasks).toHaveLength(10);
      expect(data.pagination.totalItems).toBe(25);
      expect(data.pagination.totalPages).toBe(3);
      expect(data.pagination.currentPage).toBe(1);
    });

    it('should filter by status', async () => {
      mockGetTasks.mockResolvedValueOnce([
        { id: '1', title: 'Todo Task', description: 'D', status: 'Todo', priority: 'Medium', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Done Task', description: 'D', status: 'Done', priority: 'Medium', createdAt: '2024-01-01T00:00:00Z' },
        { id: '3', title: 'Progress Task', description: 'D', status: 'In Progress', priority: 'Medium', createdAt: '2024-01-01T00:00:00Z' },
      ]);
      const request = new Request('http://localhost/api/tasks?status=Todo');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.totalItems).toBe(1);
      expect(data.tasks[0].title).toBe('Todo Task');
    });

    it('should filter by dueDate (overdue)', async () => {
      mockGetTasks.mockResolvedValueOnce([
        { id: '1', title: 'Overdue', description: 'D', status: 'Todo', priority: 'Medium', dueDate: '2020-01-01', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Future', description: 'D', status: 'Todo', priority: 'Medium', dueDate: '2030-01-01', createdAt: '2024-01-01T00:00:00Z' },
        { id: '3', title: 'No Due Date', description: 'D', status: 'Todo', priority: 'Medium', dueDate: null, createdAt: '2024-01-01T00:00:00Z' },
      ]);
      const request = new Request('http://localhost/api/tasks?dueDate=overdue');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.totalItems).toBe(1);
      expect(data.tasks[0].title).toBe('Overdue');
    });

    it('should filter by dueDate (no-date)', async () => {
      mockGetTasks.mockResolvedValueOnce([
        { id: '1', title: 'Overdue', description: 'D', status: 'Todo', priority: 'Medium', dueDate: '2020-01-01', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Future', description: 'D', status: 'Todo', priority: 'Medium', dueDate: '2030-01-01', createdAt: '2024-01-01T00:00:00Z' },
        { id: '3', title: 'No Due Date', description: 'D', status: 'Todo', priority: 'Medium', dueDate: null, createdAt: '2024-01-01T00:00:00Z' },
      ]);
      const request = new Request('http://localhost/api/tasks?dueDate=no-date');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.totalItems).toBe(1);
      expect(data.tasks[0].title).toBe('No Due Date');
    });

    it('should filter by search query in title', async () => {
      mockGetTasks.mockResolvedValueOnce([
        { id: '1', title: 'Login Page', description: 'Implement login', status: 'Todo', priority: 'High', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Dashboard', description: 'Build dashboard', status: 'Todo', priority: 'Medium', createdAt: '2024-01-01T00:00:00Z' },
        { id: '3', title: 'API', description: 'Create API', status: 'Todo', priority: 'Medium', createdAt: '2024-01-01T00:00:00Z' },
      ]);
      const request = new Request('http://localhost/api/tasks?search=dashboard');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.totalItems).toBe(1);
      expect(data.tasks[0].title).toBe('Dashboard');
    });

    it('should filter by search in description', async () => {
      mockGetTasks.mockResolvedValueOnce([
        { id: '1', title: 'Task 1', description: 'Implement navigation feature', status: 'Todo', priority: 'Medium', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Task 2', description: 'Fix bug in login', status: 'Todo', priority: 'High', createdAt: '2024-01-01T00:00:00Z' },
      ]);
      const request = new Request('http://localhost/api/tasks?search=navigation');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.totalItems).toBe(1);
    });

    it('should return pages starting from 1 minimum', async () => {
      mockGetTasks.mockResolvedValueOnce([]);
      const request = new Request('http://localhost/api/tasks?page=0&pageSize=10');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.currentPage).toBe(1);
    });

    it('should cap pageSize at 100', async () => {
      mockGetTasks.mockResolvedValueOnce(
        Array.from({ length: 200 }, (_, i) => ({
          id: String(i),
          title: `Task ${i}`,
          description: `Desc ${i}`,
          status: 'Todo',
          priority: 'Medium',
          createdAt: '2024-01-01T00:00:00Z',
        }))
      );
      const request = new Request('http://localhost/api/tasks?pageSize=1000');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.pagination.pageSize).toBe(100);
    });

    it('should sort by priority ascending', async () => {
      mockGetTasks.mockResolvedValueOnce([
        { id: '1', title: 'Low', description: 'D', status: 'Todo', priority: 'Low', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Urgent', description: 'D', status: 'Todo', priority: 'Urgent', createdAt: '2024-01-01T00:00:00Z' },
        { id: '3', title: 'High', description: 'D', status: 'Todo', priority: 'High', createdAt: '2024-01-01T00:00:00Z' },
      ]);
      const request = new Request('http://localhost/api/tasks?sortBy=priority&sortOrder=asc');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tasks[0].priority).toBe('Urgent');
      expect(data.tasks[1].priority).toBe('High');
      expect(data.tasks[2].priority).toBe('Low');
    });

    it('should sort by priority descending', async () => {
      mockGetTasks.mockResolvedValueOnce([
        { id: '1', title: 'Low', description: 'D', status: 'Todo', priority: 'Low', createdAt: '2024-01-01T00:00:00Z' },
        { id: '2', title: 'Urgent', description: 'D', status: 'Todo', priority: 'Urgent', createdAt: '2024-01-01T00:00:00Z' },
        { id: '3', title: 'High', description: 'D', status: 'Todo', priority: 'High', createdAt: '2024-01-01T00:00:00Z' },
      ]);
      const request = new Request('http://localhost/api/tasks?sortBy=priority&sortOrder=desc');
      const response = await GET(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.tasks[0].priority).toBe('Low');
      expect(data.tasks[1].priority).toBe('High');
      expect(data.tasks[2].priority).toBe('Urgent');
    });
  });

  describe('GET /api/tasks error handling', () => {
    it('should return 500 on db error', async () => {
      mockGetTasks.mockRejectedValueOnce(new Error('DB Error'));
      const request = new Request('http://localhost/api/tasks');
      const response = await GET(request);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toBe('Failed to fetch tasks');
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
          priority: 'High',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.title).toBe('Test Task');
      expect(data.status).toBe('Todo');
      expect(data.priority).toBe('High');
    });

    it('should default priority to Medium when not provided', async () => {
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test Description',
          status: 'Done',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.priority).toBe('Medium');
    });

    it('should return 400 for missing fields', async () => {
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Test Task' }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Missing required fields');
    });

    it('should return 400 for title exceeding 200 characters', async () => {
      const longTitle = 'a'.repeat(201);
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: longTitle,
          description: 'Test Description',
          status: 'Todo',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject invalid due date', async () => {
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test Description',
          status: 'Todo',
          dueDate: 'not-a-date',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject invalid status', async () => {
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test Description',
          status: 'InvalidStatus',
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should accept null dueDate', async () => {
      const request = new Request('http://localhost/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Task',
          description: 'Test Description',
          status: 'Todo',
          dueDate: null,
        }),
      });
      const response = await POST(request);
      expect(response.status).toBe(201);
      const data = await response.json();
      expect(data.dueDate).toBeNull();
    });
  });

  describe('POST /api/tasks error handling', () => {
    it('should return 500 on creation failure', async () => {
      mockCreateTask.mockRejectedValueOnce(new Error('DB Error'));
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
      expect(response.status).toBe(500);
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

    it('should return 400 for invalid priority', async () => {
      const request = new Request('http://localhost/api/tasks/123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priority: 'Radical' }),
      });
      const response = await PATCH(request, { params: { id: '123' } });
      expect(response.status).toBe(400);
    });

    it('should handle null dueDate', async () => {
      const request = new Request('http://localhost/api/tasks/123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dueDate: null }),
      });
      const response = await PATCH(request, { params: { id: '123' } });
      expect(response.status).toBe(200);
    });

    it('should handle multiple fields at once', async () => {
      const request = new Request('http://localhost/api/tasks/123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Updated Title',
          description: 'Updated Description',
          status: 'Done',
          priority: 'Low',
        }),
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

    it('should return 404 for non-existent task', async () => {
      mockDeleteTask.mockResolvedValueOnce(false);
      const request = new Request('http://localhost/api/tasks/999', {
        method: 'DELETE',
      });
      const response = await DELETE(request, { params: { id: '999' } });
      expect(response.status).toBe(404);
    });
  });
});
