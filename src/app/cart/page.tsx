'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { getProductById } from '@/lib/products';
import CartItemRow from '@/components/CartItemRow';
import CartSummary from '@/components/CartSummary';
import EmptyState from '@/components/EmptyState';

export default function CartPage() {
  const { items, itemCount, pricing } = useCart();

  const cartWithProducts = items
    .map((item) => {
      const product = getProductById(item.productId);
      return product ? { item, product } : null;
    })
    .filter(
      (entry): entry is { item: (typeof items)[number]; product: NonNullable<ReturnType<typeof getProductById>> } =>
        entry !== null,
    );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>

      {cartWithProducts.length === 0 ? (
        <div>
          <EmptyState
            title="Your cart is empty"
            message="Browse our products and add items to your cart."
          />
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm font-medium text-blue-600 hover:text-blue-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {cartWithProducts.map(({ item, product }) => (
              <CartItemRow key={item.productId} item={item} product={product} />
            ))}
          </div>
          <div>
            <CartSummary pricing={pricing} itemCount={itemCount} />
            <Link
              href="/"
              className="mt-4 block text-center text-sm text-blue-600 hover:text-blue-800"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
