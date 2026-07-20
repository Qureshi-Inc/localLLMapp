import { render, screen, fireEvent } from '@testing-library/react';
import ArsPage from '@/app/ars/page';
import { useCart } from '@/contexts/CartContext';
import ProductCard from '@/components/ProductCard';

jest.mock('@/contexts/CartContext', () => {
  const actual = jest.requireActual('@/contexts/CartContext');
  return {
    ...actual,
    useCart: jest.fn(),
  };
});

jest.mock('@/components/ProductCard', () => {
  return function MockProductCard({ product, onAddToCart }: any) {
    return (
      <div data-testid={`product-card-${product.id}`}>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <span>${product.price.toFixed(2)}</span>
        <button onClick={onAddToCart}>Add to Cart</button>
      </div>
    );
  };
});

describe('ArsPage', () => {
  const mockAddToCart = jest.fn();
  const mockCartCount = 0;

  beforeEach(() => {
    jest.clearAllMocks();
    (useCart as jest.Mock).mockReturnValue({
      cartCount: mockCartCount,
      addToCart: mockAddToCart,
    });
  });

  it('renders the page title and description', () => {
    render(<ArsPage />);
    expect(screen.getByText('Ars Collection')).toBeInTheDocument();
    expect(screen.getByText(/Discover our curated selection/)).toBeInTheDocument();
  });

  it('displays exactly three items', () => {
    render(<ArsPage />);
    const productCards = screen.getAllByTestId(/^product-card-/);
    expect(productCards).toHaveLength(3);
  });

  it('renders the correct product names', () => {
    render(<ArsPage />);
    expect(screen.getByText('Premium Widget')).toBeInTheDocument();
    expect(screen.getByText('Smart Gadget')).toBeInTheDocument();
    expect(screen.getByText('Essential Tool')).toBeInTheDocument();
  });

  it('calls addToCart when Add to Cart button is clicked', () => {
    render(<ArsPage />);
    const buttons = screen.getAllByText('Add to Cart');
    fireEvent.click(buttons[0]);
    expect(mockAddToCart).toHaveBeenCalledTimes(1);
  });

  it('does not show cart count when it is zero', () => {
    render(<ArsPage />);
    expect(screen.queryByText(/Items in cart:/)).not.toBeInTheDocument();
  });

  it('shows cart count when it is greater than zero', () => {
    (useCart as jest.Mock).mockReturnValue({
      cartCount: 2,
      addToCart: mockAddToCart,
    });
    render(<ArsPage />);
    expect(screen.getByText('Items in cart:')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});