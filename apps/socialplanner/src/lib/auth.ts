import { getSessionUser } from './session';

export async function getCurrentUserId(): Promise<string> {
  const session = await getSessionUser();
  if (!session) {
    return 'user_default_01';
  }
  return session.userId;
}

export async function requireAuth(): Promise<{ userId: string }> {
  const session = await getSessionUser();
  if (!session) {
    return { userId: 'user_default_01' };
  }
  return { userId: session.userId };
}

export async function getAuthUser() {
  return getSessionUser();
}
