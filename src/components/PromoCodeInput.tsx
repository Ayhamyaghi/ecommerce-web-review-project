'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';

export default function PromoCodeInput() {
  const { applyPromoCode, appliedPromotion, removePromotion } = useCart();
  const [code, setCode] = useState('');
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  function handleApply() {
    const result = applyPromoCode(code);
    setMessage({ text: result.message, isError: !result.valid });
    if (result.valid) {
      setCode('');
    }
  }

  function handleRemove() {
    removePromotion();
    setMessage(null);
    setCode('');
  }

  return (
    <div className="space-y-2">
      {appliedPromotion ? (
        <div className="flex items-center justify-between rounded border border-green-200 bg-green-50 px-3 py-2">
          <span className="text-sm font-medium text-green-700">
            {appliedPromotion.code}
          </span>
          <button
            onClick={handleRemove}
            aria-label={`Remove promotion code ${appliedPromotion.code}`}
            className="text-sm text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setMessage(null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleApply();
            }}
            placeholder="Promotion code"
            aria-label="Promotion code"
            className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:border-blue-500 focus:outline-none"
          />
          <button
            onClick={handleApply}
            className="rounded bg-gray-800 px-4 py-1.5 text-sm font-medium text-white hover:bg-gray-700"
          >
            Apply
          </button>
        </div>
      )}
      {message && (
        <p
          role="alert"
          className={`text-sm ${message.isError ? 'text-red-500' : 'text-green-600'}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
