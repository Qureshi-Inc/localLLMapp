'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_KEY = 'taskpulse_auth';

const ADMIN_CREDENTIALS = {
  email: 'admin@task.com',
  password: 'pass1234',
};

interface User {
  email: string;
  name: string;
}

interface AuthContextState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextState | null>(null);

export function useAuth(): AuthContextState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const auth = localStorage.getItem(AUTH_KEY);
    if (auth === 'true') {
      setUser({ email: ADMIN_CREDENTIALS.email, name: 'Admin' });
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      localStorage.setItem(AUTH_KEY, 'true');
      setUser({ email: ADMIN_CREDENTIALS.email, name: 'Admin' });
      setError(null);
      return true;
    }
    setError('Invalid email or password');
    return false;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}
