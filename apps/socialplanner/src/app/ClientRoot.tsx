'use client';

import { SessionProvider, useSession } from '@/contexts/SessionContext';
import Navbar from '@/components/Navbar';

function AppContent({ children }: { children: React.ReactNode }) {
  const { loading, user } = useSession();

  const showNavbar = !loading && user !== null;

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AppContent>{children}</AppContent>
    </SessionProvider>
  );
}
