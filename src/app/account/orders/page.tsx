'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import Skeleton from '@/components/ui/Skeleton';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{ productName: string; quantity: number; price: number }>;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

const STATUS_VARIANT: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info'> = {
  pending: 'warning',
  processing: 'info',
  shipped: 'info',
  delivered: 'success',
  cancelled: 'danger',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/orders')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setOrders(json.data.map((o: { order: Order; items: Order['items'] }) => ({
            ...o.order,
            items: o.items,
          })));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-32" />
        {[1, 2, 3].map((n) => <Skeleton key={n} className="h-24 w-full" />)}
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900">Order History</h2>
      {orders.length === 0 ? (
        <div className="mt-8 text-center">
          <p className="text-gray-500">No orders yet.</p>
          <Link href="/" className="mt-2 inline-block text-sm text-blue-600 hover:underline">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="block rounded-lg border border-gray-200 p-4 hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">{order.id}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{formatPrice(order.total)}</p>
                  <Badge variant={STATUS_VARIANT[order.status] || 'default'}>
                    {order.status}
                  </Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-gray-500 line-clamp-1">
                {order.items.map((i: { productName: string; quantity: number }) => `${i.productName} x${i.quantity}`).join(', ')}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
