'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SessionContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    setLoading(false);
  }, [fetchUser]);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } finally {
      setUser(null);
    }
  }, []);

  return (
    <SessionContext.Provider value={{ user, loading, logout: handleLogout }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextType {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
