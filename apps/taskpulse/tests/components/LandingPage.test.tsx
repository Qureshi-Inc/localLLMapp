import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Home from '@/app/page';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/components/Navbar', () => {
  return function MockNavbar() {
    return (
      <header data-testid="mock-navbar" className="sticky top-0 z-50">
        <nav>
          <span data-testid="brand-name">TaskPulse</span>
        </nav>
      </header>
    );
  };
});

jest.mock('@/lib/theme', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
  useTheme: jest.fn().mockReturnValue({ theme: 'light', toggleTheme: jest.fn() }),
}));

// Re-import Home after mocks
import HomePage from '@/app/page';

describe('Landing Page', () => {
  it('renders the hero section with heading', () => {
    render(<HomePage />);
    expect(screen.getByText(/your tasks, your team/i)).toBeInTheDocument();
  });

  it('renders Open Dashboard CTA button', () => {
    render(<HomePage />);
    const link = screen.getByRole('link', { name: /open dashboard/i });
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders Browse Tasks link', () => {
    render(<HomePage />);
    const link = screen.getByRole('link', { name: /browse tasks/i });
    expect(link).toHaveAttribute('href', '/tasks');
  });

  it('renders all feature cards', () => {
    render(<HomePage />);
    const featureTitles = [
      'Smart Organization',
      'Real-time Collaboration',
      'Analytics & Insights',
      'Lightning Fast',
      'Secure by Default',
      'Customizable Views',
    ];
    featureTitles.forEach(title => {
      expect(screen.getByText(title)).toBeInTheDocument();
    });
  });

  it('renders features section heading', () => {
    render(<HomePage />);
    expect(screen.getByText(/everything you need to stay productive/i)).toBeInTheDocument();
  });

  it('renders stats section', () => {
    render(<HomePage />);
    expect(screen.getByText('10k+')).toBeInTheDocument();
    expect(screen.getByText('99.9%')).toBeInTheDocument();
    expect(screen.getByText('2M+')).toBeInTheDocument();
    expect(screen.getByText('<50ms')).toBeInTheDocument();
  });

  it('renders CTA section', () => {
    render(<HomePage />);
    expect(screen.getByText(/ready to streamline your workflow/i)).toBeInTheDocument();
    const getStartedLink = screen.getByRole('link', { name: /get started free/i });
    expect(getStartedLink).toHaveAttribute('href', '/dashboard');
  });
});
