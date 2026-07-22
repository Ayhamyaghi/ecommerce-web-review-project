'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import Skeleton from '@/components/ui/Skeleton';
import { useToast } from '@/context/ToastContext';

interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  status: string;
  paymentStatus: string;
  email: string;
  phone: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  promotionCode: string | null;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  createdAt: string;
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

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { addToast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    fetch(`/api/orders/${id}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          setOrder(json.data.order);
          setItems(json.data.items);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCancel() {
    setCancelling(true);
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setOrder(json.data.order);
        addToast('Order cancelled successfully', 'success');
      } else {
        addToast(json.error?.message || 'Failed to cancel', 'error');
      }
    } finally {
      setCancelling(false);
      setShowCancel(false);
    }
  }

  if (loading) {
    return <div className="space-y-4">{[1, 2, 3].map((n) => <Skeleton key={n} className="h-16 w-full" />)}</div>;
  }

  if (!order) {
    return <p className="text-gray-500">Order not found.</p>;
  }

  const canCancel = order.status === 'pending' || order.status === 'processing';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/account/orders" className="text-sm text-blue-600 hover:underline mb-1 inline-block">
            &larr; Back to orders
          </Link>
          <h2 className="text-lg font-semibold text-gray-900">{order.id}</h2>
          <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="text-right">
          <Badge variant={STATUS_VARIANT[order.status] || 'default'} className="mb-1">
            {order.status}
          </Badge>
          {canCancel && (
            <div>
              <Button variant="danger" size="sm" onClick={() => setShowCancel(true)} className="mt-2">
                Cancel Order
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <section>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Items</h3>
          <div className="divide-y rounded-lg border">
            {items.map((item) => (
              <div key={item.productId} className="flex items-center gap-4 p-4">
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  {item.productImage ? (
                    <Image src={item.productImage} alt={item.productName} fill sizes="56px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300 text-xs">N/A</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity} x {formatPrice(item.price)}</p>
                </div>
                <p className="text-sm font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-6 sm:grid-cols-2">
          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Shipping Address</h3>
            <div className="rounded-lg border p-4 text-sm text-gray-600 space-y-1">
              <p>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="rounded-lg border p-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount{order.promotionCode ? ` (${order.promotionCode})` : ''}</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span>{order.shipping === 0 ? 'Free' : formatPrice(order.shipping)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>
        </div>
      </div>

      <ConfirmDialog
        isOpen={showCancel}
        onClose={() => setShowCancel(false)}
        onConfirm={handleCancel}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? This action cannot be undone and the payment will be refunded."
        confirmLabel="Cancel Order"
        variant="danger"
        loading={cancelling}
      />
    </div>
  );
}
