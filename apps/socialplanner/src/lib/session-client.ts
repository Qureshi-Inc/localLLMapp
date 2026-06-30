const SESSION_COOKIE_NAME = 'session-token';

interface SessionPayload {
  userId: string;
  token: string;
}

function getSecret(): string | undefined {
  return process.env.SESSION_SECRET;
}

async function verifySignature(payload: string, signature: string, secret: string): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const payloadData = encoder.encode(payload);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const signatureBytes = new Uint8Array(atob(signature).split('').map(c => c.charCodeAt(0)));
    return await crypto.subtle.verify('HMAC', cryptoKey, signatureBytes, payloadData);
  } catch {
    return false;
  }
}

export async function getSessionFromRequest(request: Request): Promise<{ userId: string } | null> {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = cookieHeader.split(';');
  const sessionCookie = cookies.find(c => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));

  if (!sessionCookie) {
    return null;
  }

  const cookieValue = sessionCookie.trim().split('=').slice(1).join('=');
  const parts = cookieValue.split('.');

  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = parts;
  const secret = getSecret();

  if (!secret) {
    return null;
  }

  let payload: string;
  try {
    payload = atob(encodedPayload);
  } catch {
    return null;
  }

  const valid = await verifySignature(payload, signature, secret);
  if (!valid) {
    return null;
  }

  try {
    const sessionPayload: SessionPayload = JSON.parse(payload);
    if (!sessionPayload.userId) {
      return null;
    }
    return { userId: sessionPayload.userId };
  } catch {
    return null;
  }
}

export async function signOutClient(): Promise<void> {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  await fetch('/api/auth/signout', { method: 'POST' });

  window.location.href = '/login';
}

export function getSessionFromCookies(): { userId: string } | null {
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(c => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));
  if (!sessionCookie) return null;

  const cookieValue = sessionCookie.trim().split('=').slice(1).join('=');
  const parts = cookieValue.split('.');

  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload] = parts;

  try {
    const payload = atob(encodedPayload);
    const sessionPayload: SessionPayload = JSON.parse(payload);
    if (!sessionPayload.userId) {
      return null;
    }
    return { userId: sessionPayload.userId };
  } catch {
    return null;
  }
}
