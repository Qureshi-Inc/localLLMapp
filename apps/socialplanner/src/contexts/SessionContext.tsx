'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

import { signOutClient } from '@/lib/session-client';
import { getSessionFromCookies } from '@/lib/session-client';

export interface Session {
  userId: string;
  email: string;
  name: string;
  expiresAt: string;
}

interface SessionContextType {
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadSession = useCallback(() => {
    try {
      const cookieSession = getSessionFromCookies();
      if (cookieSession) {
        const expiresAt = new Date(cookieSession.expiresAt);
        if (expiresAt > new Date()) {
          setSession(cookieSession);
          return;
        }
      }
    } catch {
      // ignore parse errors
    }
    setSession(null);
  }, []);

  useEffect(() => {
    loadSession();
    setIsLoading(false);
  }, [loadSession]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOutClient();
    } finally {
      setSession(null);
    }
  }, []);

  const isAuthenticated = session !== null;

  return (
    <SessionContext.Provider value={{ session, isLoading, isAuthenticated, signOut: handleSignOut }}>
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
