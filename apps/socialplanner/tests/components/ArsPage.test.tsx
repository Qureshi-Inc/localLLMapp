/** @jest-environment jsdom */
import { render, screen, fireEvent } from '@testing-library/react';
import ArsPage from '@/app/ars/page';
import { CartProvider } from '@/contexts/CartContext';

const renderWithCart = (ui: React.ReactElement) => {
  return render(<CartProvider>{ui}</CartProvider>);
};

describe('ArsPage', () => {
  it('renders the page without errors', () => {
    renderWithCart(<ArsPage />);
    expect(screen.getByRole('heading', { name: /ars collection/i })).toBeInTheDocument();
  });

  it('displays exactly three items', () => {
    renderWithCart(<ArsPage />);
    const productCards = screen.getAllByRole('heading', { level: 2 });
    expect(productCards).toHaveLength(3);
  });

  it('renders product names and prices', () => {
    renderWithCart(<ArsPage />);
    expect(screen.getByText('Premium Widget')).toBeInTheDocument();
    expect(screen.getByText('Smart Gadget')).toBeInTheDocument();
    expect(screen.getByText('Essential Tool')).toBeInTheDocument();
    expect(screen.getByText('$49.99')).toBeInTheDocument();
    expect(screen.getByText('$89.99')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
  });

  it('allows adding items to cart', () => {
    renderWithCart(<ArsPage />);
    const addToCartButtons = screen.getAllByRole('button', { name: /add to cart/i });
    expect(addToCartButtons).toHaveLength(3);
    
    fireEvent.click(addToCartButtons[0]);
    expect(screen.getByText(/items in cart: 1/i)).toBeInTheDocument();
    
    fireEvent.click(addToCartButtons[1]);
    expect(screen.getByText(/items in cart: 2/i)).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    renderWithCart(<ArsPage />);
    const heading = screen.getByRole('heading', { name: /ars collection/i });
    expect(heading.tagName).toBe('H1');
    
    const images = screen.getAllByRole('img');
    expect(images).toHaveLength(3);
    images.forEach((img) => {
      expect(img).toHaveAttribute('alt');
      expect(img.getAttribute('alt')).not.toBe('');
    });

    const buttons = screen.getAllByRole('button', { name: /add to cart/i });
    buttons.forEach((btn) => {
      expect(btn).toBeEnabled();
    });
  });
});