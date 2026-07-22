'use client';

import Link from 'next/link';
import { useWishlist } from '@/context/WishlistContext';
import { getProductById } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import EmptyState from '@/components/EmptyState';

export default function WishlistPage() {
  const { items, isHydrated } = useWishlist();

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Wishlist</h1>
        <div className="mt-8 animate-pulse">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-lg bg-gray-200" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const wishlistProducts = items
    .map((item) => getProductById(item.productId))
    .filter((p): p is NonNullable<typeof p> => p !== undefined);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900">
        Wishlist
        {wishlistProducts.length > 0 && (
          <span className="ml-2 text-base font-normal text-gray-500">
            ({wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'})
          </span>
        )}
      </h1>

      {wishlistProducts.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="Your wishlist is empty"
            message="Save products you love by clicking the heart icon on any product."
          />
          <div className="mt-4 text-center">
            <Link href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {wishlistProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
