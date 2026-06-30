import 'server-only';

import { cookies } from 'next/headers';
import { User } from './types';
import { getUserByEmail } from './db';

const SESSION_COOKIE_NAME = 'session_token';
const SESSION_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export interface SessionData {
  userId: string;
  email: string;
  name: string;
  expiresAt: string;
}

async function generateSessionToken(userId: string, email: string, name: string): Promise<string> {
  const crypto = await import('crypto');
  return crypto.randomUUID() + '-' + Date.now() + '-' + crypto.randomBytes(32).toString('hex');
}

export async function createSession(user: User): Promise<string> {
  const token = await generateSessionToken(user.id, user.email, user.name);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_MS).toISOString();

  const sessionData: SessionData = {
    userId: user.id,
    email: user.email,
    name: user.name,
    expiresAt,
  };

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(Date.now() + SESSION_EXPIRY_MS),
  });

  cookieStore.set('session_data', JSON.stringify(sessionData), {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(Date.now() + SESSION_EXPIRY_MS),
  });

  return token;
}

export async function validateSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!token) return null;

  const sessionStr = cookieStore.get('session_data')?.value;
  if (!sessionStr) return null;

  try {
    const session: SessionData = JSON.parse(sessionStr);
    if (new Date(session.expiresAt) < new Date()) {
      await clearSession();
      return null;
    }

    const user = await getUserByEmail(session.email);
    if (!user) {
      await clearSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete('session_data');
}

export async function getSessionUser(): Promise<SessionData | null> {
  return validateSession();
}
