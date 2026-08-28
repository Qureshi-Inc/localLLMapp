const AUTH_KEY = 'taskpulse_auth';
const ADMIN_CREDENTIALS = {
  email: 'admin@task.com',
  password: 'pass1234',
};

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(AUTH_KEY) === 'true';
}

export function login(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AUTH_KEY, 'true');
}

export function logout(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(AUTH_KEY);
}

export function getCredentials() {
  return ADMIN_CREDENTIALS;
}
