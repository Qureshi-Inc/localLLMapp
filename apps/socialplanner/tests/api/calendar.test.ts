import { describe, it, expect, beforeEach, jest } from '@jest/globals';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  getPostById: jest.fn(),
  updatePost: jest.fn(),
  getAllPosts: jest.fn(),
}));

const { auth: mockAuthFn } = require('@/lib/auth');
const { getPostById: mockGetPostById, updatePost: mockUpdatePost, getAllPosts: mockGetAllPosts } = require('@/lib/db');

import { PATCH } from '@/app/api/posts/[id]/route';

const OWNER_USER = {
  userId: 'usr_owner',
  email: 'owner@example.com',
  name: 'Owner User',
  expiresAt: '2025-12-31T23:59:59.000Z',
};

const NON_OWNER_USER = {
  userId: 'usr_other',
  email: 'other@example.com',
  name: 'Other User',
  expiresAt: '2025-12-31T23:59:59.000Z',
};

const OWNER_POST = {
  id: 'post_123',
  userId: 'usr_owner',
  title: 'Test Post',
  caption: 'Test caption',
  platform: 'Instagram',
  status: 'DRAFT',
  scheduledAt: '2025-01-15T10:00:00.000Z',
  campaign: 'test-campaign',
  notes: 'Test notes',
  imageUrl: 'https://example.com/image.jpg',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z',
};

describe('PATCH /api/posts/[id] - calendar date update', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('allows owner to update scheduledAt on their post', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockGetPostById.mockResolvedValue(OWNER_POST);
      const updatedPost = { ...OWNER_POST, scheduledAt: '2025-02-15T10:00:00Z', updatedAt: '2025-01-02T00:00:00.000Z' };
      mockUpdatePost.mockResolvedValue(updatedPost);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: '2025-02-15T10:00:00Z' }),
      });

      const response = await PATCH(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.scheduledAt).toBe('2025-02-15T10:00:00Z');
      expect(data.id).toBe('post_123');
      expect(mockUpdatePost).toHaveBeenCalledWith('post_123', 'usr_owner', expect.objectContaining({ scheduledAt: '2025-02-15T10:00:00Z' }));
    });

    it('allows owner to clear scheduledAt by setting it to null', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockGetPostById.mockResolvedValue(OWNER_POST);
      const updatedPost = { ...OWNER_POST, scheduledAt: null, updatedAt: '2025-01-02T00:00:00.000Z' };
      mockUpdatePost.mockResolvedValue(updatedPost);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: null }),
      });

      const response = await PATCH(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.scheduledAt).toBeNull();
      expect(mockUpdatePost).toHaveBeenCalledWith('post_123', 'usr_owner', expect.objectContaining({ scheduledAt: null }));
    });
  });

  describe('failure - unauthenticated', () => {
    it('returns 401 for unauthenticated request', async () => {
      mockAuthFn.mockResolvedValue(null);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: '2025-02-15T10:00:00Z' }),
      });

      const response = await PATCH(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(mockGetPostById).not.toHaveBeenCalled();
      expect(mockUpdatePost).not.toHaveBeenCalled();
    });
  });

  describe('failure - ownership', () => {
    it('returns 403 when non-owner tries to update another user post', async () => {
      mockAuthFn.mockResolvedValue(NON_OWNER_USER);
      mockGetPostById.mockResolvedValue(null);
      mockGetAllPosts.mockResolvedValue([OWNER_POST]);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: '2025-02-15T10:00:00Z' }),
      });

      const response = await PATCH(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(403);

      const data = await response.json();
      expect(data.error).toContain('do not own this post');
      expect(mockUpdatePost).not.toHaveBeenCalled();
    });

    it('returns 404 when post does not exist', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockGetPostById.mockResolvedValue(null);
      mockGetAllPosts.mockResolvedValue([]);

      const request = new Request('http://localhost/api/posts/nonexistent', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: '2025-02-15T10:00:00Z' }),
      });

      const response = await PATCH(request, { params: { id: 'nonexistent' } });
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Post not found');
    });
  });

  describe('failure - invalid date format', () => {
    it('returns 400 for invalid date string', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockGetPostById.mockResolvedValue(OWNER_POST);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: 'not-a-valid-date' }),
      });

      const response = await PATCH(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('scheduledAt must be a valid ISO date string');
      expect(mockGetAllPosts).not.toHaveBeenCalled();
      expect(mockUpdatePost).not.toHaveBeenCalled();
    });

    it('returns 400 for empty date string', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockGetPostById.mockResolvedValue(OWNER_POST);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: '' }),
      });

      const response = await PATCH(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('scheduledAt must be a valid ISO date string');
    });

    it('returns 400 for numeric date value', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledAt: 1234567890 }),
      });

      const response = await PATCH(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('scheduledAt must be a valid ISO date string');
    });
  });

  describe('failure - empty body', () => {
    it('returns 400 for empty request body', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const response = await PATCH(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('Request body is required');
    });
  });
});
