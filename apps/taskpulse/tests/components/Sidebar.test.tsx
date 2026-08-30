import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(() => '/dashboard'),
}));

jest.mock('next/link', () => {
  return function Link({ href, children, className, target, rel }: any) {
    return <a href={href} className={className} target={target} rel={rel}>{children}</a>;
  };
});

import Sidebar from '@/components/Sidebar';

const { usePathname } = require('next/navigation');

describe('Sidebar Component', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/dashboard');
  });

  it('renders collapsed sidebar', () => {
    render(<Sidebar isCollapsed onToggle={() => {}} />);
    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('w-20');
  });

  it('renders expanded sidebar', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('w-64');
  });

  it('renders sidebar toggle button', () => {
    render(<Sidebar isCollapsed onToggle={() => {}} />);
    const toggleButton = screen.getByLabelText(/expand sidebar/i);
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles sidebar width on prop change', () => {
    const { rerender } = render(<Sidebar isCollapsed onToggle={() => {}} />);
    expect(screen.getByRole('complementary')).toHaveClass('w-20');
    rerender(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    expect(screen.getByRole('complementary')).toHaveClass('w-64');
  });

  it('renders Dashboard and All Tasks nav items', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('All Tasks')).toBeInTheDocument();
  });

  it('renders main section title when expanded', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('hides section title and labels when collapsed', () => {
    render(<Sidebar isCollapsed onToggle={() => {}} />);
    expect(screen.queryByText('Main')).not.toBeInTheDocument();
  });

  it('hides on non-md screens', () => {
    render(<Sidebar isCollapsed onToggle={() => {}} />);
    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('hidden');
  });

  it('links navigate to correct hrefs', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const dashboardLink = screen.getByRole('link', { name: /dashboard/i });
    expect(dashboardLink.getAttribute('href')).toBe('/dashboard');
    const tasksLink = screen.getByRole('link', { name: /all tasks/i });
    expect(tasksLink.getAttribute('href')).toBe('/tasks');
  });

  it('renders with perimeter styling', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const nav = document.querySelector('nav[role="navigation"], nav');
    expect(nav).toBeInTheDocument();
  });
});
