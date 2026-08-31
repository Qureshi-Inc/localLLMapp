import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
const React = jest.requireActual('react');

// eslint-disable-next-line sort-keys
let _navPathname = '/';

// Mock next/link as a plain <a> for tests
jest.mock('next/link', () => {
  return function Link({ href, children, className, target, rel }: any) {
    return <a href={href} className={className} target={target} rel={rel}>{children}</a>;
  };
});

/**
 * Next.js 14 `useRouter()` calls `useContext(AppRouterContext)`.
 * Without a mounted App Router it throws "invariant expected app router to be mounted".
 * We provide a fake router via the internal AppRouterContext so the real context
 * returns a valid object instead of null.
 */
const FakeRouter = {
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
};

jest.mock('next/dist/shared/lib/app-router-context.shared-runtime', () => {
  const ctx = React.createContext(FakeRouter);
  return { __esModule: true, AppRouterContext: ctx, default: ctx };
});

// Also mock the ESM path - next/jest may compile to ESM
jest.mock('next/dist/esm/shared/lib/app-router-context.shared-runtime', () => {
  const ctx = React.createContext(FakeRouter);
  return { __esModule: true, AppRouterContext: ctx, default: ctx };
}, { virtual: true });

// Mock next/navigation - usePathname always reads _navPathname
jest.mock('next/navigation', () => ({
  usePathname: () => _navPathname,
  useRouter: () => FakeRouter,
  useSearchParams: () => new URLSearchParams(),
}));

// Mock theme provider
jest.mock('@/lib/theme-provider', () => ({
  useTheme: jest.fn().mockReturnValue({ theme: 'light', toggleTheme: jest.fn() }),
}));

// Import the real Navbar component
import Navbar from '@/components/Navbar';

// eslint-disable-next-line jest/require-top-level-describe
describe('Navbar Component', () => {
  beforeEach(() => {
    // Set localStorage so isAuthenticated() returns true (it reads localStorage)
    localStorage.setItem('taskpulse_auth', 'true');
    _navPathname = '/';
  });

  it('renders the TaskPulse logo and brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('TaskPulse')).toBeInTheDocument();
  });

  it('renders navigation links in desktop nav when authenticated', () => {
    render(<Navbar />);
    const desktopNav = document.querySelector('nav[class*="items-center gap"]');
    expect(desktopNav).toBeInTheDocument();
    const links = desktopNav?.querySelectorAll('a') || [];
    expect(links.length).toBe(2);
  });

  it('renders hamburger menu button on mobile', () => {
    render(<Navbar />);
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(hamburgerButton).toBeInTheDocument();
  });

  it('toggles mobile menu when hamburger is clicked', () => {
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
    // Both desktop and mobile navs contain a link to /tasks (CSS hides mobile on desktop)
    expect(document.querySelector('a[href="/tasks"]')).toBeInTheDocument();
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(hamburgerButton);

    const mobileNav = document.querySelector('[class*="px-4 pb-4"]') as HTMLElement;
    expect(mobileNav).toBeInTheDocument();
    // Mobile authed nav: Dashboard link, Tasks link (Logout is a <button>)
    expect(mobileNav?.querySelectorAll('a').length).toBe(2);
  });

  it('renders header element with correct structure', () => {
    render(<Navbar />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('has aria-expanded on toggle button', () => {
    render(<Navbar />);
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(hamburgerButton).toHaveAttribute('aria-expanded');
  });

  it('dashboard link is not active on root pathname', () => {
    render(<Navbar />);
    const desktopNav = document.querySelector('nav[class*="items-center gap"]');
    const dashboardLink = desktopNav?.querySelector('a[href="/dashboard"]');
    expect(dashboardLink).not.toHaveClass('bg-primary/10');
  });

  it('closes mobile menu when a link is clicked', async () => {
    render(<Navbar />);
    // Assert Dashboard link exists
    expect(document.querySelector('a[href="/dashboard"]')).toBeInTheDocument();
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

    const mobileNav = document.querySelector('[class*="px-4 pb-4"]') as HTMLElement;
    // mobile auth nav first link is Dashboard
    const link = mobileNav?.querySelectorAll('a')[0];
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', '/dashboard');
    fireEvent.click(link!);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('has sticky positioning', () => {
    render(<Navbar />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('sticky');
  });

  it('has backdrop blur effect', () => {
    render(<Navbar />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('backdrop-blur-md');
  });
});
