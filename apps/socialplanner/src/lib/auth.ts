import { getSessionUser } from './session';

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
