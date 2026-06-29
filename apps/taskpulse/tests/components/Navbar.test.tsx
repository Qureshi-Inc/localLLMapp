import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '@/components/Navbar';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

const { usePathname } = require('next/navigation');

describe('Navbar Component', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/');
  });

  it('renders the TaskPulse logo and brand name', () => {
    render(<Navbar />);
    expect(screen.getByText('TaskPulse')).toBeInTheDocument();
  });

  it('renders navigation links in desktop nav', () => {
    render(<Navbar />);
    const navs = document.querySelectorAll('nav');
    const desktopNav = navs[0];
    const links = desktopNav.querySelectorAll('a');
    expect(links.length).toBe(3);
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

  it('renders mobile menu with nav links when opened', () => {
    render(<Navbar />);
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(hamburgerButton);

    const mobileNav = document.querySelector('[class*="px-4 pb-4"]') as HTMLElement;
    expect(mobileNav).toBeInTheDocument();
    expect(mobileNav?.querySelectorAll('a').length).toBe(3);
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

  it('uses className based on path for active state', () => {
    const { rerender } = render(<Navbar />);
    const allLinks = document.querySelectorAll('a');
    allLinks.forEach(link => {
      expect(link).not.toHaveClass('bg-primary/10');
    });
  });

  it('closes mobile menu when a link is clicked', () => {
    render(<Navbar />);
    const hamburgerButton = screen.getByRole('button', { name: /toggle navigation menu/i });
    fireEvent.click(hamburgerButton);
    expect(hamburgerButton).toHaveAttribute('aria-expanded', 'true');

    const mobileNav = document.querySelector('[class*="px-4 pb-4"]') as HTMLElement;
    const dashboardLink = mobileNav?.querySelectorAll('a')[1];
    fireEvent.click(dashboardLink!);
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
