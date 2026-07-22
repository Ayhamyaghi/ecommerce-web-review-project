'use client';

interface StarDisplayProps {
  rating: number;
  size?: 'sm' | 'md';
}

export function StarDisplay({ rating, size = 'md' }: StarDisplayProps) {
  const sizeClass = size === 'sm' ? 'text-base' : 'text-xl';

  return (
    <span
      className={`inline-flex ${sizeClass}`}
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          className={star <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300'}
        >
          ★
        </span>
      ))}
    </span>
  );
}
