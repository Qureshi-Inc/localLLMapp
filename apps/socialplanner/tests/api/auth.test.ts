import { describe, it, expect, beforeEach, jest } from '@jest/globals';

const mockHash = jest.fn(() => Promise.resolve('hashedpassword'));
const mockCompare = jest.fn(() => Promise.resolve(true));

jest.mock('bcryptjs', () => ({
  hash: (...args: unknown[]) => mockHash(...args),
  compare: (...args: unknown[]) => mockCompare(...args),
}));

jest.mock('@/lib/session', () => ({
  createSession: jest.fn(),
  destroySession: jest.fn(),
}));

jest.mock('@/lib/db', () => ({
  getUserByEmail: jest.fn(),
  createUser: jest.fn(),
}));

import { POST as registerPOST } from '@/app/api/auth/register/route';
import { POST as signinPOST } from '@/app/api/auth/signin/route';
import { POST as signoutPOST } from '@/app/api/auth/signout/route';
import * as dbModule from '@/lib/db';

const mockGetUserByEmail = dbModule.getUserByEmail as jest.Mock;
const mockCreateUser = dbModule.createUser as jest.Mock;

const VALID_USER = {
  id: 'usr_123',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('creates user and returns 201 for valid email/password', async () => {
      mockGetUserByEmail.mockResolvedValue(null);
      mockCreateUser.mockResolvedValue(VALID_USER);

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await registerPOST(request);
      expect(response.status).toBe(201);

      const data = await response.json();
      expect(data.name).toBe('Test User');
      expect(data.email).toBe('test@example.com');
      expect(mockGetUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockCreateUser).toHaveBeenCalled();
    });
  });

  describe('failure - duplicate email', () => {
    it('returns 409 when email already exists', async () => {
      mockGetUserByEmail.mockResolvedValue(VALID_USER);

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await registerPOST(request);
      expect(response.status).toBe(409);

      const data = await response.json();
      expect(data.error).toBe('A user with this email already exists');
      expect(mockCreateUser).not.toHaveBeenCalled();
    });

    it('returns 409 when createUser throws duplicate error', async () => {
      mockGetUserByEmail.mockResolvedValue(null);
      mockCreateUser.mockRejectedValue(new Error('User with this email already exists'));

      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await registerPOST(request);
      expect(response.status).toBe(409);
    });
  });

  describe('failure - invalid input', () => {
    it('returns 400 for invalid email format', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'not-an-email',
          password: 'password123',
        }),
      });

      const response = await registerPOST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('email must be a valid email address');
      expect(mockGetUserByEmail).not.toHaveBeenCalled();
    });

    it('returns 400 for missing password', async () => {
      const request = new Request('http://localhost/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
        }),
      });

      const response = await registerPOST(request);
      expect(response.status).toBe(400);

      const data = await response.json();
      expect(data.error).toBe('password is required');
    });
  });
});

describe('POST /api/auth/signin', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('returns user data for correct credentials', async () => {
      mockGetUserByEmail.mockResolvedValue(VALID_USER);
      mockCompare.mockResolvedValue(true);

      const request = new Request('http://localhost/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123',
        }),
      });

      const response = await signinPOST(request);
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.email).toBe('test@example.com');
      expect(data.name).toBe('Test User');
    });
  });

  describe('failure', () => {
    it('returns 401 for wrong password', async () => {
      mockGetUserByEmail.mockResolvedValue(VALID_USER);
      mockCompare.mockResolvedValue(false);

      const request = new Request('http://localhost/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await signinPOST(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Invalid email or password');
    });

    it('returns 401 for non-existent user', async () => {
      mockGetUserByEmail.mockResolvedValue(null);

      const request = new Request('http://localhost/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'nonexistent@example.com',
          password: 'password123',
        }),
      });

      const response = await signinPOST(request);
      expect(response.status).toBe(401);

      const data = await response.json();
      expect(data.error).toBe('Invalid email or password');
    });
  });
});

describe('POST /api/auth/signout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('success', () => {
    it('returns 200 and clears session', async () => {
      const response = await signoutPOST();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBe('Signed out successfully');
    });

    it('returns 200 even without active session', async () => {
      const response = await signoutPOST();
      expect(response.status).toBe(200);

      const data = await response.json();
      expect(data.message).toBe('Signed out successfully');
    });
  });

  describe('failure', () => {
    it('returns 500 if destroySession throws', async () => {
      const module = await import('@/lib/session');
      const originalDestroy = module.destroySession;
      (module.destroySession as jest.Mock).mockRejectedValue(new Error('Failed to destroy session'));

      const response = await signoutPOST();
      expect(response.status).toBe(500);

      const data = await response.json();
      expect(data.error).toBe('Internal server error');

      module.destroySession = originalDestroy;
    });
  });
});
