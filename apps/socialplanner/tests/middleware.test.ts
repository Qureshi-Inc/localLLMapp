import { describe, it, expect, jest, beforeEach } from '@jest/globals';

const mockCookiesStore = {
  set: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
};

jest.mock('next/headers', () => ({
  cookies: jest.fn(() => mockCookiesStore),
}));

const mockNextResponse = {
  next: jest.fn(() => ({ type: 'next' })),
  redirect: jest.fn((url) => ({ type: 'redirect', url })),
};

jest.mock('next/server', () => ({
  NextResponse: mockNextResponse,
}));

process.env.SESSION_SECRET = 'test-secret-key-for-signing';

describe('middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCookiesStore.get.mockReturnValue(undefined);
  });

  describe('protected routes', () => {
    it('redirects unauthenticated users to /login with from parameter for protected routes', async () => {
      mockCookiesStore.get.mockReturnValue(undefined);

      const { middleware } = await import('@/middleware');

      const mockRequest = {
        nextUrl: new URL('/dashboard', 'http://localhost:3000/dashboard'),
        url: 'http://localhost:3000/dashboard',
      } as any;

      const response = await middleware(mockRequest);

      expect(response.type).toBe('redirect');
      const redirectUrl = response.url as string;
      expect(redirectUrl).toContain('/login');
      expect(redirectUrl).toContain('from=');
    });

    it('allows access for authenticated users on protected routes', async () => {
      const sessionCookieValue = btoa(JSON.stringify({ userId: 'usr_test123', token: 'abc123' })) + '.fakesignature';
      mockCookiesStore.get.mockImplementation((name) => {
        if (name === 'session-token') {
          return { value: sessionCookieValue };
        }
        return undefined;
      });

      const { middleware } = await import('@/middleware');

      const mockRequest = {
        nextUrl: new URL('/posts', 'http://localhost:3000/posts'),
        url: 'http://localhost:3000/posts',
      } as any;

      const response = await middleware(mockRequest);

      expect(response.type).toBe('next');
    });
  });

  describe('/login route', () => {
    it('allows unauthenticated users to access /login', async () => {
      mockCookiesStore.get.mockReturnValue(undefined);

      const { middleware } = await import('@/middleware');

      const mockRequest = {
        nextUrl: new URL('/login', 'http://localhost:3000/login'),
        url: 'http://localhost:3000/login',
      } as any;

      const response = await middleware(mockRequest);

      expect(response.type).toBe('next');
    });

    it('redirects authenticated users from /login to /', async () => {
      const sessionCookieValue = btoa(JSON.stringify({ userId: 'usr_test123', token: 'abc123' })) + '.fakesignature';
      mockCookiesStore.get.mockImplementation((name) => {
        if (name === 'session-token') {
          return { value: sessionCookieValue };
        }
        return undefined;
      });

      const { middleware } = await import('@/middleware');

      const mockRequest = {
        nextUrl: new URL('/login', 'http://localhost:3000/login'),
        url: 'http://localhost:3000/login',
      } as any;

      const response = await middleware(mockRequest);

      expect(response.type).toBe('redirect');
      expect(response.url).toBe('http://localhost:3000/');
    });
  });

  describe('/register route', () => {
    it('allows unauthenticated users to access /register', async () => {
      mockCookiesStore.get.mockReturnValue(undefined);

      const { middleware } = await import('@/middleware');

      const mockRequest = {
        nextUrl: new URL('/register', 'http://localhost:3000/register'),
        url: 'http://localhost:3000/register',
      } as any;

      const response = await middleware(mockRequest);

      expect(response.type).toBe('next');
    });

    it('redirects authenticated users from /register to /', async () => {
      const sessionCookieValue = btoa(JSON.stringify({ userId: 'usr_test123', token: 'abc123' })) + '.fakesignature';
      mockCookiesStore.get.mockImplementation((name) => {
        if (name === 'session-token') {
          return { value: sessionCookieValue };
        }
        return undefined;
      });

      const { middleware } = await import('@/middleware');

      const mockRequest = {
        nextUrl: new URL('/register', 'http://localhost:3000/register'),
        url: 'http://localhost:3000/register',
      } as any;

      const response = await middleware(mockRequest);

      expect(response.type).toBe('redirect');
      expect(response.url).toBe('http://localhost:3000/');
    });
  });

  describe('public routes', () => {
    it('allows access to /api/health without authentication', async () => {
      mockCookiesStore.get.mockReturnValue(undefined);

      const { middleware } = await import('@/middleware');

      const mockRequest = {
        nextUrl: new URL('/api/health', 'http://localhost:3000/api/health'),
        url: 'http://localhost:3000/api/health',
      } as any;

      const response = await middleware(mockRequest);

      expect(response.type).toBe('next');
    });

    it('allows access to /api/auth/signin without authentication', async () => {
      mockCookiesStore.get.mockReturnValue(undefined);

      const { middleware } = await import('@/middleware');

      const mockRequest = {
        nextUrl: new URL('/api/auth/signin', 'http://localhost:3000/api/auth/signin'),
        url: 'http://localhost:3000/api/auth/signin',
      } as any;

      const response = await middleware(mockRequest);

      expect(response.type).toBe('next');
    });

    it('allows access to /api/auth/register without authentication', async () => {
      mockCookiesStore.get.mockReturnValue(undefined);

      const { middleware } = await import('@/middleware');

      const mockRequest = {
        nextUrl: new URL('/api/auth/register', 'http://localhost:3000/api/auth/register'),
        url: 'http://localhost:3000/api/auth/register',
      } as any;

      const response = await middleware(mockRequest);

      expect(response.type).toBe('next');
    });
  });
});
