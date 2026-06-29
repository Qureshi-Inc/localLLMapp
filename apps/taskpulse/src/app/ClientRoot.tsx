'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Sidebar from '@/components/Sidebar';

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 pt-16">
        <Sidebar isCollapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main
          className={`flex-1 transition-all duration-300 ease-in-out
            ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}
            p-4 sm:p-6 lg:p-8`}
        >
          {children}
        </main>
      </div>
      <Footer />
    </div>
  );
}
