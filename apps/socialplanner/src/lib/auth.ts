import { getSessionUser } from './session';
import bcrypt from 'bcryptjs';

export async function getCurrentUserId(): Promise<string | null> {
  const session = await getSessionUser();
  if (!session) {
    return null;
  }
  return session.userId;
}

export async function requireAuth(): Promise<{ userId: string } | null> {
  const session = await getSessionUser();
  if (!session) {
    return null;
  }
  return { userId: session.userId };
}

export async function auth() {
  return getSessionUser();
}

export async function getAuthUser() {
  return getSessionUser();
}

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
