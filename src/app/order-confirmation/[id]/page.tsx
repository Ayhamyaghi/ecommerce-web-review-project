'use client';

import { use } from 'react';
import Link from 'next/link';

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-100 mx-auto">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="h-10 w-10 text-green-600"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </div>

      <h1 className="mt-6 text-3xl font-bold text-gray-900">Order Placed!</h1>
      <p className="mt-3 text-gray-600">
        Thank you for your purchase. Your order has been received and is being processed.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-left">
        <p className="text-sm text-gray-500">Order reference</p>
        <p className="font-mono text-lg font-semibold text-gray-900">{id}</p>
      </div>

      <p className="mt-4 text-sm text-gray-500">
        A confirmation email will be sent once your order ships.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/"
          className="rounded-md bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Continue Shopping
        </Link>
        <Link
          href="/cart"
          className="rounded-md border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View Cart
        </Link>
      </div>
    </div>
  );
}
