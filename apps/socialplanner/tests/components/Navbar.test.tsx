import { render, screen, fireEvent } from '@testing-library/react';
import Navbar from '@/components/Navbar';
import { useSession } from '@/contexts/SessionContext';
import { usePathname } from 'next/navigation';

jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

jest.mock('next/link', () => {
  return function Link({ href, children, ...props }: any) {
    return <a href={href} {...props}>{children}</a>;
  };
});

jest.mock('@/contexts/SessionContext', () => ({
  useSession: jest.fn(),
}));

describe('Navbar', () => {
  const mockLogout = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useSession as jest.Mock).mockReturnValue({ logout: mockLogout });
    (usePathname as jest.Mock).mockReturnValue('/');
  });

  it('renders the logo and app name', () => {
    render(<Navbar />);
    expect(screen.getByText('SocialPlanner')).toBeInTheDocument();
  });

  it('renders all navigation items', () => {
    render(<Navbar />);
    const navItems = ['Dashboard', 'Calendar', 'All Posts', 'Create Post', 'Ars', 'Tasks', 'TaskPulse', 'Blog'];
    navItems.forEach((item) => {
      expect(screen.getByText(item)).toBeInTheDocument();
    });
  });

  it('highlights the active navigation item based on pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/posts');
    render(<Navbar />);
    
    const allPostsLink = screen.getByText('All Posts');
    expect(allPostsLink).toHaveClass('text-white bg-gray-700');
    
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).not.toHaveClass('text-white bg-gray-700');
  });

  it('renders the logout button', () => {
    render(<Navbar />);
    expect(screen.getByText('Log Out')).toBeInTheDocument();
  });

  it('calls logout when logout button is clicked', async () => {
    render(<Navbar />);
    const logoutButton = screen.getByText('Log Out');
    await fireEvent.click(logoutButton);
    expect(mockLogout).toHaveBeenCalledTimes(1);
  });

  it('renders mobile menu toggle button with correct aria-label', () => {
    render(<Navbar />);
    expect(screen.getByLabelText('Toggle mobile menu')).toBeInTheDocument();
  });

  it('toggles mobile menu visibility when toggle button is clicked', () => {
    render(<Navbar />);
    const toggleButton = screen.getByLabelText('Toggle mobile menu');
    
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
    
    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');
  });

  it('has correct accessibility attributes on links', () => {
    render(<Navbar />);
    const navLinks = screen.getAllByRole('link');
    navLinks.forEach((link) => {
      expect(link).toHaveAttribute('href');
    });
  });
});