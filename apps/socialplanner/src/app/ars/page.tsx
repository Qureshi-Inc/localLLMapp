'use client';

import { useState } from 'react';

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
  const [cartCount, setCartCount] = useState(0);

  const handleAddToCart = () => {
    setCartCount((prev) => prev + 1);
  };

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
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col"
            >
              <div className="aspect-square w-full bg-gray-100 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-6 flex flex-col flex-1">
                <h2 className="text-xl font-semibold text-gray-900">{product.name}</h2>
                <p className="mt-2 text-gray-600 text-sm flex-1">{product.description}</p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                  <button
                    onClick={handleAddToCart}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
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