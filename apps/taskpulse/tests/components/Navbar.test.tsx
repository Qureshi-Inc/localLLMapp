import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
const React = jest.requireActual('react');

jest.mock('next/link', () => {
  return function Link({ href, children, className, target, rel }: any) {
    return <a href={href} className={className} target={target} rel={rel}>{children}</a>;
  };
});

const FakeRouterContextValue = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/dist/shared/lib/app-router-context.shared-runtime', () => {
  const ctx = React.createContext(FakeRouterContextValue);
  return { __esModule: true, AppRouterContext: ctx, default: ctx };
});

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/'),
  useRouter: jest.fn(() => FakeRouterContextValue),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

jest.mock('@/lib/theme-provider', () => ({
  useTheme: jest.fn().mockReturnValue({ theme: 'light', toggleTheme: jest.fn() }),
}));

const mockIsAuthenticated = jest.fn(() => true);
jest.mock('@/lib/auth', () => ({
  isAuthenticated: mockIsAuthenticated,
  logout: jest.fn(),
}));

import Navbar from '@/components/Navbar';
const { usePathname, useRouter } = require('next/navigation');

describe('Navbar Component', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/');
    mockIsAuthenticated.mockReturnValue(true);
    jest.clearAllMocks();
  });

  function asyncDelay() {
    return new Promise(resolve => setTimeout(resolve, 50));
  }

  it('renders the TaskPulse logo and brand name', async () => {
    render(<Navbar />);
    await asyncDelay();
    expect(screen.getByText('TaskPulse')).toBeInTheDocument();
  });

  it('renders navigation links in desktop nav', async () => {
    render(<Navbar />);
    await asyncDelay();
    const allNavs = document.querySelectorAll('nav');
    const desktopNav = Array.from(allNavs).find(nav => nav.classList.contains('hidden'));
    expect(desktopNav).toBeInTheDocument();
    const links = desktopNav?.querySelectorAll('a') || [];
    expect(links.length).toBe(2);
  });

  it('renders hamburger menu button on mobile', async () => {
    render(<Navbar />);
    await asyncDelay();
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(hamburgerButton).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger is clicked', async () => {
    render(<Navbar />);
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });

    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('renders mobile menu with nav links when opened', async () => {
    render(<Navbar />);
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(hamburgerButton);

    const mobileNav = document.querySelector('[class*="px-4 pb-4"]') as HTMLElement;
    expect(mobileNav).toBeInTheDocument();
    expect(mobileNav?.querySelectorAll('a').length).toBe(2);
  });

  it('renders header element with correct structure', async () => {
    render(<Navbar />);
    await asyncDelay();
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('has aria-expanded attribute on toggle button', async () => {
    render(<Navbar />);
    await asyncDelay();
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(hamburgerButton).toHaveAttribute('aria-expanded');
  });

  it('uses className based on path for active state', async () => {
    render(<Navbar />);
    await asyncDelay();
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach(link => {
      expect(link).not.toHaveClass('bg-primary/10');
    });
  });

  it('marks Dashboard link as active when pathname is /dashboard', async () => {
    usePathname.mockReturnValue('/dashboard');
    render(<Navbar />);
    await asyncDelay();
    const dashboardLink = document.querySelector('a[href="/dashboard"]');
    expect(dashboardLink).toBeInTheDocument();
    expect(dashboardLink!).toHaveClass('bg-primary/10');
  });

  it('marks Tasks link as active when pathname is /tasks', async () => {
    usePathname.mockReturnValue('/tasks');
    render(<Navbar />);
    await asyncDelay();
    const tasksLink = document.querySelector('a[href="/tasks"]');
    expect(tasksLink).toBeInTheDocument();
    expect(tasksLink!).toHaveClass('bg-primary/10');
  });

  it('closes mobile menu when a link is clicked', async () => {
    render(<Navbar />);
    await asyncDelay();
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

    const mobileNav = document.querySelector('[class*="px-4 pb-4"]') as HTMLElement;
    const tasksLink = mobileNav?.querySelectorAll('a')[1];
    fireEvent.click(tasksLink!);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('has sticky positioning', async () => {
    render(<Navbar />);
    await asyncDelay();
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky');
  });

  it('has backdrop blur effect', async () => {
    render(<Navbar />);
    await asyncDelay();
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('backdrop-blur-md');
  });
});
