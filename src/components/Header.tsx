'use client';

import Link from 'next/link';
import CartIcon from './CartIcon';
import { useWishlist } from '@/context/WishlistContext';

function WishlistIcon() {
  const { items, isHydrated } = useWishlist();
  const count = isHydrated ? items.length : 0;

  return (
    <Link
      href="/wishlist"
      className="relative flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
      aria-label={`Wishlist${count > 0 ? ` (${count} items)` : ''}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-5 w-5"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
      {count > 0 && (
        <span
          aria-hidden="true"
          className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white"
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-xl font-bold text-gray-900">
          ShopWave
        </Link>
        <nav className="flex items-center gap-6" aria-label="Main navigation">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Products
          </Link>
          <WishlistIcon />
          <CartIcon />
        </nav>
      </div>
    </header>
  );
}
