'use client';

import { formatPrice } from '@/lib/format';
import { PricingBreakdown } from '@/lib/types';
import PromoCodeInput from './PromoCodeInput';

interface CartSummaryProps {
  pricing: PricingBreakdown;
  itemCount: number;
}

export default function CartSummary({ pricing, itemCount }: CartSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Subtotal ({itemCount} items)</span>
          <span>{formatPrice(pricing.subtotal)}</span>
        </div>
        {pricing.discount > 0 && (
          <div className="flex justify-between text-sm text-green-600">
            <span>Discount</span>
            <span>-{formatPrice(pricing.discount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-gray-600">
          <span>Shipping</span>
          <span>{pricing.shipping === 0 ? 'Free' : formatPrice(pricing.shipping)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(pricing.total)}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 border-t border-gray-200 pt-4">
        <PromoCodeInput />
      </div>
    </div>
  );
}
