import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockCookiesStore = {
  set: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
};

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => mockCookiesStore),
}));

process.env.SESSION_SECRET = 'test-secret-key-for-signing';

describe('session module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookiesStore.get.mockReturnValue(undefined);
  });

  describe('createSession', () => {
    it('creates a session cookie with correct configuration', async () => {
      const { createSession } = await import('@/lib/session');

      const testUser = {
        id: 'usr_test123',
        name: 'Test User',
        email: 'test@example.com',
        password: 'hashedpassword',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const token = await createSession(testUser);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(mockCookiesStore.set).toHaveBeenCalledWith(
        'session-token',
        expect.stringContaining('.'),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
        })
      );
    });

    it('returns a UUID-formatted token', async () => {
      const { createSession } = await import('@/lib/session');

      const testUser = {
        id: 'usr_test789',
        name: 'Test User',
        email: 'test3@example.com',
        password: 'hashedpassword',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      const token = await createSession(testUser);

      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
      expect(uuidRegex.test(token)).toBe(true);
    });
  });

  describe('getSession', () => {
    it('returns null when no session cookie exists', async () => {
      mockCookiesStore.get.mockReturnValue(undefined);

      const { getSession } = await import('@/lib/session');
      const result = await getSession();

      expect(result).toBeNull();
    });

    it('returns session user when valid cookie exists', async () => {
      const { createSession, getSession } = await import('@/lib/session');

      const testUser = {
        id: 'usr_valid123',
        name: 'Valid User',
        email: 'valid@example.com',
        password: 'hashedpassword',
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
      };

      await createSession(testUser);

      const sessionCookieValue = mockCookiesStore.set.mock.calls[0][1];
      mockCookiesStore.get.mockImplementation((name) => {
        if (name === 'session-token') {
          return { value: sessionCookieValue };
        }
        return undefined;
      });

      const result = await getSession();
      expect(result).not.toBeNull();
      expect(result!.userId).toBe('usr_valid123');
    });
  });

  describe('destroySession', () => {
    it('deletes the session cookie', async () => {
      const { destroySession } = await import('@/lib/session');

      await destroySession();

      expect(mockCookiesStore.set).toHaveBeenCalledWith(
        'session-token',
        '',
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'lax',
          path: '/',
          maxAge: 0,
        })
      );
    });
  });
});
