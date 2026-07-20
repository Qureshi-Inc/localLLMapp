'use client';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
  };
  onAddToCart: () => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col">
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
            onClick={onAddToCart}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}