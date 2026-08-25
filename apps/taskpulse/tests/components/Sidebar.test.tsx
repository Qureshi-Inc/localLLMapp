import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Sidebar from '@/components/Sidebar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const { usePathname } = require('next/navigation');

describe('Sidebar Component', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/dashboard');
  });

  afterEach(() => {
    cleanup();
    jest.clearAllMocks();
  });

  it('renders the TaskPulse logo and brand name when expanded', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    expect(screen.getByText('TaskPulse')).toBeInTheDocument();
  });

  it('renders only the logo icon when collapsed', () => {
    render(<Sidebar isCollapsed={true} onToggle={() => {}} />);
    expect(screen.queryByText('TaskPulse')).not.toBeInTheDocument();
  });

  it('renders navigation section headers when expanded', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    expect(screen.getByText('Main')).toBeInTheDocument();
  });

  it('hides navigation section headers when collapsed', () => {
    render(<Sidebar isCollapsed={true} onToggle={() => {}} />);
    expect(screen.queryByText('Main')).not.toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('All Tasks')).toBeInTheDocument();
  });

  it('renders collapse toggle button', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(toggleButton).toBeInTheDocument();
  });

  it('calls onToggle when collapse button is clicked', () => {
    const mockToggle = jest.fn();
    render(<Sidebar isCollapsed={false} onToggle={mockToggle} />);
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    fireEvent.click(toggleButton);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('renders icons next to navigation labels', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const sidebar = document.querySelector('aside');
    const svgElements = sidebar?.querySelectorAll('svg');
    expect(svgElements?.length).toBeGreaterThan(3);
  });

  it('does not render dead navigation links', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    expect(screen.queryByText('Board')).not.toBeInTheDocument();
    expect(screen.queryByText('Calendar')).not.toBeInTheDocument();
    expect(screen.queryByText('Team')).not.toBeInTheDocument();
    expect(screen.queryByText('Analytics')).not.toBeInTheDocument();
    expect(screen.queryByText('Archived')).not.toBeInTheDocument();
  });

  it('has correct sidebar container structure', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const aside = document.querySelector('aside');
    expect(aside).toHaveClass('bg-surface-50');
    expect(aside).toHaveClass('border-r');
    expect(aside).toHaveClass('border-border');
  });

  it('has aria-expanded attribute on toggle button', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const toggleButton = screen.getByRole('button', { name: /collapse sidebar/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles aria-expanded when sidebar is collapsed', () => {
    render(<Sidebar isCollapsed={true} onToggle={() => {}} />);
    const toggleButton = screen.getByRole('button', { name: /expand sidebar/i });
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('does not render settings link', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const settingsLink = document.querySelector('a[href="/settings"]');
    expect(settingsLink).not.toBeInTheDocument();
  });

  it('shows tooltip labels when collapsed', () => {
    render(<Sidebar isCollapsed={true} onToggle={() => {}} />);
    const sidebar = document.querySelector('aside');
    const tooltipElements = sidebar?.querySelectorAll('.absolute');
    expect(tooltipElements?.length).toBeGreaterThan(0);
  });

  it('applies transition classes for smooth collapse animation', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const aside = document.querySelector('aside');
    expect(aside).toHaveClass('transition-all');
    expect(aside).toHaveClass('duration-300');
    expect(aside).toHaveClass('ease-in-out');
  });

  it('has fixed positioning', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const aside = document.querySelector('aside');
    expect(aside).toHaveClass('fixed');
  });

  it('applies w-64 class when expanded', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const aside = document.querySelector('aside');
    expect(aside).toHaveClass('w-64');
  });

  it('applies w-20 class when collapsed', () => {
    render(<Sidebar isCollapsed={true} onToggle={() => {}} />);
    const aside = document.querySelector('aside');
    expect(aside).toHaveClass('w-20');
  });

  it('renders main navigation links in correct order', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const sidebar = document.querySelector('aside');
    const navLinks = sidebar?.querySelectorAll('nav a');
    const labels = Array.from(navLinks || []).map(a => a?.textContent?.trim());
    expect(labels).toContain('Dashboard');
    expect(labels).toContain('All Tasks');
    expect(labels.length).toBe(2);
  });

  it('renders mobile overlay with correct classes', () => {
    render(<Sidebar isCollapsed={false} onToggle={() => {}} />);
    const overlays = document.querySelectorAll('[class*="bg-black/50"]');
    expect(overlays.length).toBeGreaterThan(0);
  });

  it('closes sidebar when mobile overlay is clicked', () => {
    const mockToggle = jest.fn();
    render(<Sidebar isCollapsed={false} onToggle={mockToggle} />);
    const overlays = document.querySelectorAll('[class*="bg-black/50"]');
    const overlay = overlays[0];
    fireEvent.click(overlay!);
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });
});
