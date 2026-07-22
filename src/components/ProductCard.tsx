'use client';

import Link from 'next/link';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import WishlistButton from './WishlistButton';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const { addToast } = useToast();
  const outOfStock = product.stock <= 0;
  const cartItem = items.find((i) => i.productId === product.id);
  const atStockLimit = (cartItem?.quantity ?? 0) >= product.stock;

  function handleAddToCart() {
    addToCart(product);
    addToast(`${product.name} added to cart`, 'success');
  }

  return (
    <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block relative">
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
        {outOfStock && (
          <span className="absolute left-2 top-2 rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
            Out of Stock
          </span>
        )}
        {!outOfStock && product.stock <= 5 && (
          <span className="absolute left-2 top-2 rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            Only {product.stock} left
          </span>
        )}
        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <WishlistButton productId={product.id} />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {product.category}
        </span>
        <Link href={`/products/${product.id}`} className="mt-1 block">
          <h3 className="font-semibold text-gray-900 hover:text-blue-600 line-clamp-1">
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
          <span className={`text-xs ${outOfStock ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {outOfStock ? 'Unavailable' : `${product.stock} in stock`}
          </span>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock || atStockLimit}
          aria-label={`Add ${product.name} to cart`}
          className="mt-3 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
        >
          {outOfStock ? 'Unavailable' : atStockLimit ? 'Stock Limit' : 'Add to Cart'}
        </button>
      </div>
    </div>
  );
}
