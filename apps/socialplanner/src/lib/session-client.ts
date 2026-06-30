const SESSION_COOKIE_NAME = 'session_token';
const SESSION_DATA_COOKIE_NAME = 'session_data';

export interface Session {
  userId: string;
  email: string;
  name: string;
  expiresAt: string;
}

export async function signOutClient(): Promise<void> {
  document.cookie = `${SESSION_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  document.cookie = `${SESSION_DATA_COOKIE_NAME}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;

  await fetch('/api/auth/signout', { method: 'POST' });

  window.location.href = '/login';
}

export function getSessionFromCookies(): Session | null {
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(c => c.trim().startsWith(`${SESSION_DATA_COOKIE_NAME}=`));
  if (!sessionCookie) return null;

  try {
    const jsonStr = sessionCookie.trim().split('=').slice(1).join('=');
    return JSON.parse(jsonStr) as Session;
  } catch {
    return null;
  }
}
