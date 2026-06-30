import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { GET, POST } from '@/app/api/posts/route';
import { GET as GET_POST, PUT, DELETE } from '@/app/api/posts/[id]/route';
import * as dbModule from '@/lib/db';
import * as authModule from '@/lib/auth';

jest.mock('@/lib/auth', () => ({
  auth: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  getPostsByUser: jest.fn(),
  getPostById: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn(),
  deletePost: jest.fn(),
  getAllPosts: jest.fn(),
}));

const mockAuthFn = authModule.auth as jest.Mock;
const mockGetPostsByUser = dbModule.getPostsByUser as jest.Mock;
const mockGetPostById = dbModule.getPostById as jest.Mock;
const mockCreatePost = dbModule.createPost as jest.Mock;
const mockUpdatePost = dbModule.updatePost as jest.Mock;
const mockDeletePost = dbModule.deletePost as jest.Mock;

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

describe('POST /api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('creates a post and returns 201 for valid data', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockCreatePost.mockResolvedValue(OWNER_POST);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Post',
          caption: 'Test caption',
          platform: 'Instagram',
          status: 'DRAFT',
          scheduledAt: '2025-01-15T10:00:00.000Z',
          campaign: 'test-campaign',
          notes: 'Test notes',
          imageUrl: 'https://example.com/image.jpg',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.title).toBe('Test Post');
      expect(data.caption).toBe('Test caption');
      expect(data.platform).toBe('Instagram');
      expect(data.status).toBe('DRAFT');
      expect(data.userId).toBe('usr_owner');
      expect(mockCreatePost).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'usr_owner',
          title: 'Test Post',
          caption: 'Test caption',
          platform: 'Instagram',
          status: 'DRAFT',
        }),
      );
    });

    it('creates a post with minimal required fields', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      const minimalPost = { ...OWNER_POST, scheduledAt: null, campaign: null, notes: null, imageUrl: null };
      mockCreatePost.mockResolvedValue(minimalPost);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Minimal Post',
          caption: 'Minimal caption',
          platform: 'X',
          status: 'IDEA',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.title).toBe('Minimal Post');
      expect(data.platform).toBe('X');
    });
  });

  describe('failure - invalid form data', () => {
    it('returns 400 for missing title', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: 'Has caption',
          platform: 'Instagram',
          status: 'DRAFT',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('title is required');
    });

    it('returns 400 for empty title', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '',
          caption: 'Has caption',
          platform: 'Instagram',
          status: 'DRAFT',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('title is required');
    });

    it('returns 400 for missing caption', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Has title',
          platform: 'Instagram',
          status: 'DRAFT',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('caption is required');
    });

    it('returns 400 for invalid platform', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Valid title',
          caption: 'Valid caption',
          platform: 'invalid-platform',
          status: 'DRAFT',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('platform must be one of');
    });

    it('returns 400 for invalid status', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Valid title',
          caption: 'Valid caption',
          platform: 'Instagram',
          status: 'INVALID',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('status must be one of');
    });

    it('returns 400 for invalid scheduledAt date', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Valid title',
          caption: 'Valid caption',
          platform: 'Instagram',
          status: 'DRAFT',
          scheduledAt: 'not-a-date',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('scheduledAt must be a valid ISO date string');
    });

    it('returns 400 for non-string campaign field', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Valid title',
          caption: 'Valid caption',
          platform: 'Instagram',
          status: 'DRAFT',
          campaign: 123,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('campaign must be a string or null');
    });
  });

  describe('failure - authentication', () => {
    it('returns 401 for unauthenticated request', async () => {
      mockAuthFn.mockResolvedValue(null);

      const request = new Request('http://localhost/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthenticated post',
          caption: 'Should fail',
          platform: 'Instagram',
          status: 'DRAFT',
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(mockCreatePost).not.toHaveBeenCalled();
    });
  });
});

describe('GET /api/posts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('returns all posts for authenticated user', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockGetPostsByUser.mockResolvedValue([OWNER_POST]);

      const request = new Request('http://localhost/api/posts');

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].id).toBe('post_123');
    });

    it('returns empty array when user has no posts', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockGetPostsByUser.mockResolvedValue([]);

      const request = new Request('http://localhost/api/posts');

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(0);
    });

    it('filters posts by status', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      const draftPost = { ...OWNER_POST, status: 'DRAFT' as const };
      const publishedPost = { ...OWNER_POST, id: 'post_456', status: 'PUBLISHED' as const };
      mockGetPostsByUser.mockResolvedValue([draftPost, publishedPost]);

      const request = new Request('http://localhost/api/posts?status=DRAFT');

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.length).toBe(1);
      expect(data[0].status).toBe('DRAFT');
    });

    it('filters posts by platform', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      const instagramPost = { ...OWNER_POST, platform: 'Instagram' as const };
      const tiktokPost = { ...OWNER_POST, id: 'post_456', platform: 'TikTok' as const };
      mockGetPostsByUser.mockResolvedValue([instagramPost, tiktokPost]);

      const request = new Request('http://localhost/api/posts?platform=TikTok');

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.length).toBe(1);
      expect(data[0].platform).toBe('TikTok');
    });

    it('filters posts by both status and platform', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      const draftInstagramPost = { ...OWNER_POST, id: 'post_123', status: 'DRAFT' as const, platform: 'Instagram' as const };
      const publishedInstagramPost = { ...OWNER_POST, id: 'post_456', status: 'PUBLISHED' as const, platform: 'Instagram' as const };
      const draftTiktokPost = { ...OWNER_POST, id: 'post_789', status: 'DRAFT' as const, platform: 'TikTok' as const };
      mockGetPostsByUser.mockResolvedValue([draftInstagramPost, publishedInstagramPost, draftTiktokPost]);

      const request = new Request('http://localhost/api/posts?status=DRAFT&platform=Instagram');

      const response = await GET(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.length).toBe(1);
      expect(data[0].id).toBe('post_123');
    });
  });

  describe('failure - authentication', () => {
    it('returns 401 for unauthenticated request', async () => {
      mockAuthFn.mockResolvedValue(null);

      const request = new Request('http://localhost/api/posts');

      const response = await GET(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(mockGetPostsByUser).not.toHaveBeenCalled();
    });
  });
});

describe('GET /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('returns post for owner', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockGetPostById.mockResolvedValue(OWNER_POST);

      const request = new Request('http://localhost/api/posts/post_123');
      const response = await GET_POST(request, { params: { id: 'post_123' } });

      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.id).toBe('post_123');
      expect(data.userId).toBe('usr_owner');
    });
  });

  describe('failure', () => {
    it('returns 404 when post not found', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockGetPostById.mockResolvedValue(null);

      const request = new Request('http://localhost/api/posts/nonexistent');
      const response = await GET_POST(request, { params: { id: 'nonexistent' } });

      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Post not found');
    });

    it('returns 404 when non-owner tries to access post', async () => {
      mockAuthFn.mockResolvedValue(NON_OWNER_USER);
      mockGetPostById.mockResolvedValue(null);

      const request = new Request('http://localhost/api/posts/post_123');
      const response = await GET_POST(request, { params: { id: 'post_123' } });

      expect(response.status).toBe(404);
    });

    it('returns 401 for unauthenticated request', async () => {
      mockAuthFn.mockResolvedValue(null);

      const request = new Request('http://localhost/api/posts/post_123');
      const response = await GET_POST(request, { params: { id: 'post_123' } });

      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
    });
  });
});

describe('PUT /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('allows owner to edit their post', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      const updatedPost = { ...OWNER_POST, title: 'Updated Title', updatedAt: '2025-01-02T00:00:00.000Z' };
      mockUpdatePost.mockResolvedValue(updatedPost);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Updated Title',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.title).toBe('Updated Title');
      expect(data.id).toBe('post_123');
      expect(mockUpdatePost).toHaveBeenCalledWith('post_123', 'usr_owner', expect.any(Object));
    });

    it('allows owner to update multiple fields', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      const updatedPost = { ...OWNER_POST, caption: 'Updated caption', status: 'PUBLISHED' as const };
      mockUpdatePost.mockResolvedValue(updatedPost);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: 'Updated caption',
          status: 'PUBLISHED',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.caption).toBe('Updated caption');
      expect(data.status).toBe('PUBLISHED');
    });

    it('allows owner to update platform', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      const updatedPost = { ...OWNER_POST, platform: 'TikTok' as const };
      mockUpdatePost.mockResolvedValue(updatedPost);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'TikTok',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.platform).toBe('TikTok');
    });

    it('allows owner to update status', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      const updatedPost = { ...OWNER_POST, status: 'SCHEDULED' as const };
      mockUpdatePost.mockResolvedValue(updatedPost);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'SCHEDULED',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.status).toBe('SCHEDULED');
    });

    it('allows owner to set nullable fields to null', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      const updatedPost = { ...OWNER_POST, campaign: null, notes: null };
      mockUpdatePost.mockResolvedValue(updatedPost);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign: null,
          notes: null,
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(200);
    });
  });

  describe('failure - validation', () => {
    it('returns 400 for empty title', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('title must be a non-empty string');
    });

    it('returns 400 for empty caption', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption: '',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('caption must be a non-empty string');
    });

    it('returns 400 for invalid platform', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'invalid',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('platform must be one of');
    });

    it('returns 400 for invalid status', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'INVALID',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('status must be one of');
    });

    it('returns 400 for invalid scheduledAt date', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scheduledAt: 'not-a-date',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toContain('scheduledAt must be a valid ISO date string');
    });

    it('returns 404 when post not found or unauthorized', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockUpdatePost.mockResolvedValue(null);

      const request = new Request('http://localhost/api/posts/nonexistent', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Updated',
        }),
      });

      const response = await PUT(request, { params: { id: 'nonexistent' } });
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Post not found or unauthorized');
    });
  });

  describe('failure - ownership', () => {
    it('does not allow non-owner to edit another user post', async () => {
      mockAuthFn.mockResolvedValue(NON_OWNER_USER);
      mockUpdatePost.mockResolvedValue(null);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Hacked title',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Post not found or unauthorized');
      expect(mockUpdatePost).toHaveBeenCalledWith('post_123', 'usr_other', expect.any(Object));
    });

    it('returns 401 for unauthenticated request', async () => {
      mockAuthFn.mockResolvedValue(null);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Unauthorized edit',
        }),
      });

      const response = await PUT(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(mockUpdatePost).not.toHaveBeenCalled();
    });
  });
});

describe('DELETE /api/posts/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('allows owner to delete their post', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockDeletePost.mockResolvedValue(true);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBe('Post deleted successfully');
      expect(mockDeletePost).toHaveBeenCalledWith('post_123', 'usr_owner');
    });
  });

  describe('failure - ownership', () => {
    it('does not allow non-owner to delete another user post', async () => {
      mockAuthFn.mockResolvedValue(NON_OWNER_USER);
      mockDeletePost.mockResolvedValue(false);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Post not found or unauthorized');
      expect(mockDeletePost).toHaveBeenCalledWith('post_123', 'usr_other');
    });

    it('returns 404 when post does not exist', async () => {
      mockAuthFn.mockResolvedValue(OWNER_USER);
      mockDeletePost.mockResolvedValue(false);

      const request = new Request('http://localhost/api/posts/nonexistent', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'nonexistent' } });
      expect(response.status).toBe(404);

      const data = await response.json();
      expect(data.error).toBe('Post not found or unauthorized');
    });

    it('returns 401 for unauthenticated request', async () => {
      mockAuthFn.mockResolvedValue(null);

      const request = new Request('http://localhost/api/posts/post_123', {
        method: 'DELETE',
      });

      const response = await DELETE(request, { params: { id: 'post_123' } });
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Unauthorized');
      expect(mockDeletePost).not.toHaveBeenCalled();
    });
  });
});
