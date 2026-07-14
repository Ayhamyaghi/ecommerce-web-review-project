'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const outOfStock = product.stock <= 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <Link href={`/products/${product.id}`} className="block">
        <div className="flex h-48 items-center justify-center bg-gray-100 text-4xl text-gray-300">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="h-16 w-16"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
            />
          </svg>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase text-gray-500">
          {product.category}
        </span>
        <Link href={`/products/${product.id}`} className="mt-1 block">
          <h3 className="font-semibold text-gray-900 hover:text-blue-600">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-gray-500">
          {product.description}
        </p>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">
            {formatPrice(product.price)}
          </span>
          {outOfStock ? (
            <span className="text-sm font-medium text-red-500">
              Out of stock
            </span>
          ) : (
            <span className="text-sm text-gray-500">
              {product.stock} in stock
            </span>
          )}
        </div>
        <button
          onClick={() => addToCart(product)}
          disabled={outOfStock}
          aria-label={`Add ${product.name} to cart`}
          className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          {outOfStock ? 'Unavailable' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
