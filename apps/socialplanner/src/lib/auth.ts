// TODO: Replace with real authentication (e.g., NextAuth.js) in production

export function getCurrentUserId(): string {
  return 'user_default_01';
}

export function requireAuth(): { userId: string } {
  return { userId: getCurrentUserId() };
}
