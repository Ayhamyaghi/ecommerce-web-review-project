'use client';

import { use } from 'react';
import Link from 'next/link';
import { getProductById, getRelatedProducts } from '@/lib/products';
import { formatPrice } from '@/lib/format';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/context/ToastContext';
import EmptyState from '@/components/EmptyState';
import { ReviewSection } from '@/components/ReviewSection';
import Breadcrumb from '@/components/Breadcrumb';
import WishlistButton from '@/components/WishlistButton';
import ProductCard from '@/components/ProductCard';

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const product = getProductById(id);
  const { addToCart, items } = useCart();
  const { addToast } = useToast();

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

  // TypeScript does not preserve narrowing inside nested function declarations,
  // so capture the narrowed value in a new const.
  const p = product;
  const outOfStock = p.stock <= 0;
  const cartItem = items.find((i) => i.productId === p.id);
  const currentInCart = cartItem?.quantity ?? 0;
  const atStockLimit = currentInCart >= p.stock;
  const relatedProducts = getRelatedProducts(p, 4);

  function handleAddToCart() {
    addToCart(p);
    addToast(`${p.name} added to cart`, 'success');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Breadcrumb
        items={[
          { label: 'Products', href: '/' },
          { label: p.category, href: `/?category=${encodeURIComponent(p.category)}` },
          { label: p.name },
        ]}
      />

      <div className="mt-6 grid gap-8 md:grid-cols-2">
        <div className="relative flex items-center justify-center rounded-lg bg-gray-100 py-24">
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
          <div className="absolute right-3 top-3">
            <WishlistButton productId={p.id} />
          </div>
        </div>

        <div>
          <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-blue-700">
            {p.category}
          </span>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">
            {p.name}
          </h1>
          <p className="mt-4 text-gray-600 leading-relaxed">{p.description}</p>

          <p className="mt-6 text-3xl font-bold text-gray-900">
            {formatPrice(p.price)}
          </p>

          <div className="mt-2">
            {outOfStock ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                Out of stock
              </span>
            ) : p.stock <= 5 ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                Only {p.stock} left{currentInCart > 0 && ` (${currentInCart} in cart)`}
              </span>
            ) : (
              <span className="text-sm text-gray-500">
                {p.stock} in stock{currentInCart > 0 && ` (${currentInCart} in cart)`}
              </span>
            )}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={handleAddToCart}
              disabled={outOfStock || atStockLimit}
              aria-label={`Add ${p.name} to cart`}
              className="rounded-md bg-blue-600 px-6 py-3 text-base font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 transition-colors"
            >
              {outOfStock
                ? 'Out of Stock'
                : atStockLimit
                  ? 'Stock Limit Reached'
                  : 'Add to Cart'}
            </button>

            {!outOfStock && (
              <Link
                href="/cart"
                onClick={() => { if (!atStockLimit) addToCart(p); }}
                className="rounded-md border border-gray-300 px-6 py-3 text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Buy Now
              </Link>
            )}
          </div>
        </div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <h2 className="text-xl font-bold text-gray-900">
            More from {p.category}
          </h2>
          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      <div className="mt-12">
        <ReviewSection productId={p.id} />
      </div>
    </div>
  );
}
