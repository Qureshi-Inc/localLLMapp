import { describe, it, expect, jest, beforeEach } from '@jest/globals';

process.env.SESSION_SECRET = 'test-secret-key-for-signing';

describe('getSessionFromRequest', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns null when no cookie header exists', async () => {
    const { getSessionFromRequest } = await import('@/lib/session-client');
    const request = new Request('http://localhost/api/test');
    const result = await getSessionFromRequest(request);
    expect(result).toBeNull();
  });

  it('returns null when session cookie is missing', async () => {
    const { getSessionFromRequest } = await import('@/lib/session-client');
    const request = new Request('http://localhost/api/test', {
      headers: {
        'Cookie': 'other-cookie=value',
      },
    });
    const result = await getSessionFromRequest(request);
    expect(result).toBeNull();
  });

  it('returns null for invalid cookie format (no signature)', async () => {
    const { getSessionFromRequest } = await import('@/lib/session-client');
    const invalidValue = 'invalid-no-signature';
    const request = new Request('http://localhost/api/test', {
      headers: {
        'Cookie': `session-token=${invalidValue}`,
      },
    });
    const result = await getSessionFromRequest(request);
    expect(result).toBeNull();
  });

  it('returns null for tampered signature', async () => {
    const { getSessionFromRequest } = await import('@/lib/session-client');
    const payload = btoa(JSON.stringify({ userId: 'usr_123', token: 'test-token' }));
    const tamperedValue = payload + '.invalid-signature';
    const request = new Request('http://localhost/api/test', {
      headers: {
        'Cookie': `session-token=${tamperedValue}`,
      },
    });
    const result = await getSessionFromRequest(request);
    expect(result).toBeNull();
  });

  it('returns null when SESSION_SECRET is missing', async () => {
    const originalSecret = process.env.SESSION_SECRET;
    delete process.env.SESSION_SECRET;

    const { getSessionFromRequest } = await import('@/lib/session-client');
    const payload = btoa(JSON.stringify({ userId: 'usr_123', token: 'test-token' }));
    const validSecret = 'test-secret-key-for-signing';
    const { createSignature } = await import('@/lib/session-client');

    process.env.SESSION_SECRET = originalSecret;
    const request = new Request('http://localhost/api/test', {
      headers: {
        'Cookie': `session-token=${payload}.fakesig`,
      },
    });
    const result = await getSessionFromRequest(request);
    expect(result).toBeNull();
  });

  it('returns null for malformed base64 payload', async () => {
    const { getSessionFromRequest } = await import('@/lib/session-client');
    const request = new Request('http://localhost/api/test', {
      headers: {
        'Cookie': `session-token=not-valid-base64!!!.signature`,
      },
    });
    const result = await getSessionFromRequest(request);
    expect(result).toBeNull();
  });

  it('returns null for valid base64 but invalid JSON payload', async () => {
    const { getSessionFromRequest } = await import('@/lib/session-client');
    const invalidJson = btoa('not json at all');
    const request = new Request('http://localhost/api/test', {
      headers: {
        'Cookie': `session-token=${invalidJson}.signature`,
      },
    });
    const result = await getSessionFromRequest(request);
    expect(result).toBeNull();
  });
});
