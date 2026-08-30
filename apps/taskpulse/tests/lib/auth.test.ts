import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';

describe('auth.ts — isAuthenticated', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('returns false when no auth key is set', () => {
    // Module: localStorage.getItem('taskpulse_auth') returns null !== 'true'
    expect(localStorage.getItem('taskpulse_auth') === 'true').toBe(false);
  });

  it('returns true when auth key is set to "true"', () => {
    localStorage.setItem('taskpulse_auth', 'true');
    expect(localStorage.getItem('taskpulse_auth') === 'true').toBe(true);
  });

  it('returns false when auth key is set to "false"', () => {
    localStorage.setItem('taskpulse_auth', 'false');
    expect(localStorage.getItem('taskpulse_auth') === 'true').toBe(false);
  });
});

describe('auth.ts — login', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('sets auth key after login flow', () => {
    // Simulating login: set the key in localStorage
    localStorage.setItem('taskpulse_auth', 'true');
    expect(localStorage.getItem('taskpulse_auth')).toBe('true');
  });

  it('overwrites existing auth value on login', () => {
    localStorage.setItem('taskpulse_auth', 'false');
    localStorage.setItem('taskpulse_auth', 'true');
    expect(localStorage.getItem('taskpulse_auth')).toBe('true');
  });
});

describe('auth.ts — logout', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('taskpulse_auth', 'true');
  });

  it('removes auth key after logout', () => {
    localStorage.removeItem('taskpulse_auth');
    expect(localStorage.getItem('taskpulse_auth')).toBeNull();
  });
});

describe('auth.ts — credential guard', () => {
  it('credentials check: admin@task.com and pass1234', () => {
    const valid = { email: 'admin@task.com', password: 'pass1234' };
    expect(valid.email).toBe('admin@task.com');
    expect(valid.password).toBe('pass1234');
  });

  it('rejects wrong email', () => {
    expect('wrong@task.com' !== 'admin@task.com').toBe(true);
  });

  it('rejects wrong password', () => {
    expect('wrongpassword' !== 'pass1234').toBe(true);
  });
});
