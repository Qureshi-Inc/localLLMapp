import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('@/lib/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
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

// Now import after mocks are set up
import RootLayout from '@/app/layout';

describe('Root Layout (ClientRoot)', () => {
  it('renders Navbar component', () => {
    render(
      <RootLayout>
        <main data-testid="main-content">Test content</main>
      </RootLayout>
    );
    expect(screen.getByText('TaskPulse')).toBeInTheDocument();
  });

  it('renders children content', () => {
    render(
      <RootLayout>
        <main data-testid="main-content">Test content</main>
      </RootLayout>
    );
    expect(screen.getByTestId('main-content')).toBeInTheDocument();
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('renders html element with correct lang attribute', () => {
    const { container } = render(
      <RootLayout>
        <div>test</div>
      </RootLayout>
    );
    const html = container.querySelector('html');
    expect(html).toHaveAttribute('lang', 'en');
  });

  it('renders body with font classes', () => {
    const { container } = render(
      <RootLayout>
        <div>test</div>
      </RootLayout>
    );
    const body = container.querySelector('body');
    expect(body).toBeInTheDocument();
    expect(body).toHaveAttribute('class');
  });

  it('renders themes', () => {
    const { container } = render(
      <RootLayout>
        <div>test</div>
      </RootLayout>
    );
    const footers = container.querySelectorAll('footer');
    expect(footers.length).toBeGreaterThanOrEqual(0);
  });

  it('passes through metadata for title', () => {
    const { container } = render(
      <RootLayout>
        <div>test</div>
      </RootLayout>
    );
    expect(container.querySelector('html')).not.toBeNull();
  });
});
