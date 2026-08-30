import 'server-only';

import { cookies } from 'next/headers';
import { SessionUser, User } from './types';

const SESSION_COOKIE_NAME = 'session-token';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

// Known-insecure placeholder values that must never be used to sign sessions.
// If any of these (or a too-short secret) reach production, session cookies are
// trivially forgeable for any userId, so we fail closed instead (CWE-798/CWE-521).
const WEAK_SECRETS = new Set(['change-me-in-production', 'changeme', 'secret', 'password']);
const MIN_SECRET_LENGTH = 32;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error('SESSION_SECRET environment variable is not set');
  }
  if (WEAK_SECRETS.has(secret) || secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      'SESSION_SECRET is a placeholder or too weak. Set a random value of at ' +
        `least ${MIN_SECRET_LENGTH} characters (e.g. \`openssl rand -base64 32\`).`
    );
  }
  return secret;
}

async function createSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const payloadData = encoder.encode(payload);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, payloadData);
  const signatureArray = new Uint8Array(signature);
  const signatureBytes = Array.from(signatureArray);
  const chunks: string[] = [];
  for (let i = 0; i < signatureBytes.length; i += 8192) {
    chunks.push(String.fromCharCode.apply(null, signatureBytes.slice(i, i + 8192)));
  }
  return btoa(chunks.join(''));
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

export async function createSession(user: User): Promise<string> {
  const token = crypto.randomUUID();
  const payload = JSON.stringify({ userId: user.id, token });
  const secret = getSecret();
  const signature = await createSignature(payload, secret);
  const cookieValue = btoa(payload) + '.' + signature;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, cookieValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!cookieValue) {
    return null;
  }

  const parts = cookieValue.split('.');
  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, signature] = parts;
  const secret = getSecret();

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
    const sessionUser: SessionUser = JSON.parse(payload);
    if (!sessionUser.userId) {
      return null;
    }
    return sessionUser;
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

export const getSessionUser = getSession;
