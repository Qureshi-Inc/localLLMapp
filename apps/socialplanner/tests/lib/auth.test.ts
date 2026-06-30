import { describe, it, expect, jest } from '@jest/globals';

const mockHash = jest.fn();
const mockCompare = jest.fn();

jest.mock('bcryptjs', () => ({
  hash: (...args: unknown[]) => mockHash(...args),
  compare: (...args: unknown[]) => mockCompare(...args),
}));

jest.mock('@/lib/session', () => ({}));

import { hashPassword, verifyPassword, validateEmail } from '@/lib/auth';

describe('hashPassword', () => {
  it('calls bcrypt.hash with the password and salt rounds of 10', async () => {
    mockHash.mockResolvedValue('hashedpassword');
    const result = await hashPassword('mysecretpassword');
    expect(mockHash).toHaveBeenCalledWith('mysecretpassword', 10);
    expect(result).toBe('hashedpassword');
  });

  it('returns the hashed password string', async () => {
    mockHash.mockResolvedValue('$2a$10$abc123hash');
    const result = await hashPassword('password123');
    expect(typeof result).toBe('string');
  });
});

describe('verifyPassword', () => {
  it('returns true when password matches hash', async () => {
    mockCompare.mockResolvedValue(true);
    const result = await verifyPassword('correctpassword', '$2a$10$abc123hash');
    expect(mockCompare).toHaveBeenCalledWith('correctpassword', '$2a$10$abc123hash');
    expect(result).toBe(true);
  });

  it('returns false when password does not match hash', async () => {
    mockCompare.mockResolvedValue(false);
    const result = await verifyPassword('wrongpassword', '$2a$10$abc123hash');
    expect(mockCompare).toHaveBeenCalledWith('wrongpassword', '$2a$10$abc123hash');
    expect(result).toBe(false);
  });
});

describe('validateEmail', () => {
  it('returns true for valid email addresses', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('test.email+tag@domain.co.uk')).toBe(true);
    expect(validateEmail('user@sub.domain.com')).toBe(true);
  });

  it('returns false for invalid email addresses', () => {
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('@no-local.com')).toBe(false);
    expect(validateEmail('user@')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail('spaces in@email.com')).toBe(false);
  });
});
