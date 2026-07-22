'use client';

import { useWishlist } from '@/context/WishlistContext';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

export default function WishlistButton({ productId, className = '' }: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist, isHydrated } = useWishlist();
  const inList = isHydrated && isInWishlist(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      aria-label={inList ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={inList}
      title={inList ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`flex h-8 w-8 items-center justify-center rounded-full bg-white shadow transition-colors hover:bg-gray-50 ${className}`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill={inList ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
        className={`h-4 w-4 ${inList ? 'text-red-500' : 'text-gray-400'}`}
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
        />
      </svg>
    </button>
  );
}
