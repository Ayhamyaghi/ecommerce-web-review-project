'use client';

import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (rating: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
  const [hovered, setHovered] = useState(0);
  const displayValue = hovered || value;

  return (
    <span
      className="inline-flex gap-0.5"
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star !== 1 ? 's' : ''}`}
          className={`text-2xl cursor-pointer bg-transparent border-none p-0 transition-colors ${
            star <= displayValue ? 'text-yellow-400' : 'text-gray-300'
          }`}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' && value < 5) onChange(value + 1);
            if (e.key === 'ArrowLeft' && value > 1) onChange(value - 1);
          }}
        >
          ★
        </button>
      ))}
    </span>
  );
}
