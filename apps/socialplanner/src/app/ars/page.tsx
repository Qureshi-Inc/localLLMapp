'use client';

import ProductCard from '@/components/ProductCard';
import { useCart } from '@/contexts/CartContext';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Widget',
    description: 'A high-quality widget designed for modern workflows.',
    price: 49.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '2',
    name: 'Smart Gadget',
    description: 'An intelligent gadget that simplifies your daily tasks.',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=500&q=80',
  },
  {
    id: '3',
    name: 'Essential Tool',
    description: 'The must-have tool for professionals and enthusiasts alike.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500&q=80',
  },
];

export default function ArsPage() {
  const { cartCount, addToCart } = useCart();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Ars Collection</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our curated selection of premium items designed to elevate your experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {PRODUCTS.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addToCart} />
          ))}
        </div>

        {cartCount > 0 && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Items in cart: <span className="font-semibold text-gray-900">{cartCount}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}