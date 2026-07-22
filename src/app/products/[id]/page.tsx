'use client';

import { use } from 'react';
import Link from 'next/link';
import { getProductById } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import EmptyState from '@/components/EmptyState';
import { ReviewSection } from '@/components/ReviewSection';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProductById(id);
  const { addToCart, items } = useCart();

  if (!product) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
          &larr; Back to products
        </Link>
        <EmptyState
          title="Product not found"
          message="The product you are looking for does not exist or has been removed."
        />
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const cartItem = items.find((i) => i.productId === product.id);
  const currentInCart = cartItem?.quantity ?? 0;
  const atStockLimit = currentInCart >= product.stock;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
        &larr; Back to products
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="flex items-center justify-center rounded-lg bg-gray-100 py-24">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="h-24 w-24 text-gray-300"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
            />
          </svg>
        </div>

        <div>
          <span className="text-sm font-medium uppercase text-gray-500">
            {product.category}
          </span>
          <h1 className="mt-1 text-3xl font-bold text-gray-900">
            {product.name}
          </h1>
          <p className="mt-4 text-gray-600">{product.description}</p>

          <p className="mt-6 text-2xl font-bold text-gray-900">
            {formatPrice(product.price)}
          </p>

          <div className="mt-2">
            {outOfStock ? (
              <span className="text-sm font-medium text-red-500">
                Out of stock
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                {product.stock} in stock
                {currentInCart > 0 && ` (${currentInCart} in cart)`}
              </span>
            )}
          </div>

          <button
            onClick={() => addToCart(product)}
            disabled={outOfStock || atStockLimit}
            aria-label={`Add ${product.name} to cart`}
            className="mt-6 w-full rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 md:w-auto"
          >
            {outOfStock
              ? 'Out of Stock'
              : atStockLimit
                ? 'Stock Limit Reached'
                : 'Add to Cart'}
          </button>
        </div>
      </div>

      <div className="mt-12">
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}
