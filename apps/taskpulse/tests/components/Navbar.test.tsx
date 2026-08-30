import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';

jest.mock('next/link', () => {
  return function Link({ href, children, className, target, rel }: any) {
    return <a href={href} className={className} target={target} rel={rel}>{children}</a>;
  };
});

jest.mock('@/lib/theme-provider', () => ({
  useTheme: jest.fn().mockReturnValue({ theme: 'light', toggleTheme: jest.fn() }),
}));

jest.mock('@/lib/auth', () => ({
  isAuthenticated: jest.fn(() => false),
  logout: jest.fn(),
}));

import Navbar from '@/components/Navbar';
const { usePathname, setPathname } = require('next/navigation');

describe('Navbar Component', () => {
  beforeEach(() => {
    setPathname('/');
    jest.clearAllMocks();
  });

  it('renders the TaskPulse logo and brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('TaskPulse')).toBeInTheDocument();
  });

  it('renders Sign In link when not authenticated', () => {
    render(<Navbar />);
    const signInLinks = Array.from(document.querySelectorAll('a[href="/login"]'));
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Logout')).not.toBeInTheDocument();
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

  it('renders header element with correct structure', () => {
    render(<Navbar />);
    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('has aria-expanded attribute on toggle button', () => {
    render(<Navbar />);
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    expect(hamburgerButton).toHaveAttribute('aria-expanded');
  });

  it('renders theme toggle button to switch to dark mode when in light mode', () => {
    render(<Navbar />);
    const themeToggle = screen.getByRole('button', {
      name: /switch to dark mode/i,
    });
    expect(themeToggle).toBeInTheDocument();
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

  it('renders Logo link to home page', () => {
    render(<Navbar />);
    const logoLink = screen.getByRole('link', { name: 'TaskPulse' });
    expect(logoLink).toHaveAttribute('href', '/');
  });

  it('dark mode class is applied on header', () => {
    render(<Navbar />);
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('dark:border-surface-700', 'dark:bg-surface-900/80');
  });

  it('has mobile nav section with sign in link', () => {
    render(<Navbar />);
    const mobileNav = document.querySelector('[class*="px-4 pb-4"]');
    expect(mobileNav).toBeInTheDocument();
    const mobileLoginLink = mobileNav?.querySelector('a[href="/login"]');
    expect(mobileLoginLink).toBeInTheDocument();
  });
});
