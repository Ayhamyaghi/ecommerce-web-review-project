'use client';

import { CartItem, Product } from '@/lib/types';
import { formatPrice } from '@/lib/format';
import { getItemSubtotal } from '@/lib/cart-utils';
import { useCart } from '@/context/CartContext';

interface CartItemRowProps {
  item: CartItem;
  product: Product;
}

export default function CartItemRow({ item, product }: CartItemRowProps) {
  const { updateItemQuantity, removeFromCart } = useCart();
  const subtotal = getItemSubtotal(item.quantity, product.price);

  return (
    <div className="flex items-center gap-4 border-b border-gray-100 py-4">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded bg-gray-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="h-8 w-8 text-gray-300"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z"
          />
        </svg>
      </div>

      <div className="flex-1">
        <h3 className="font-medium text-gray-900">{product.name}</h3>
        <p className="text-sm text-gray-500">{formatPrice(product.price)} each</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() =>
            updateItemQuantity(item.productId, item.quantity - 1, product.stock)
          }
          aria-label={`Decrease quantity of ${product.name}`}
          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          -
        </button>
        <span className="w-8 text-center text-sm font-medium" aria-label={`Quantity: ${item.quantity}`}>
          {item.quantity}
        </span>
        <button
          onClick={() =>
            updateItemQuantity(item.productId, item.quantity + 1, product.stock)
          }
          disabled={item.quantity >= product.stock}
          aria-label={`Increase quantity of ${product.name}`}
          className="flex h-8 w-8 items-center justify-center rounded border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-300"
        >
          +
        </button>
      </div>

      <div className="w-24 text-right">
        <p className="font-medium text-gray-900">{formatPrice(subtotal)}</p>
      </div>

      <button
        onClick={() => removeFromCart(item.productId)}
        aria-label={`Remove ${product.name} from cart`}
        className="ml-2 text-sm text-red-500 hover:text-red-700"
      >
        Remove
      </button>
    </div>
  );
}
