'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function CartIcon() {
  const { itemCount } = useCart();

  return (
    <Link
      href="/cart"
      className="relative text-gray-600 hover:text-gray-900"
      aria-label={`Shopping cart with ${itemCount} items`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121 0 2.002-.881 2.002-2.003V6.75m-14.22 0h14.22m-14.22 0L5.106 5.272M7.5 14.25 5.106 5.272m0 0H3.636"
        />
      </svg>
      {itemCount > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
