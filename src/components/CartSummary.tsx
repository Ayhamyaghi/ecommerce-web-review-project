import { formatPrice } from '@/lib/format';

interface CartSummaryProps {
  total: number;
  itemCount: number;
}

export default function CartSummary({ total, itemCount }: CartSummaryProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
      <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Items ({itemCount})</span>
          <span>{formatPrice(total)}</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
