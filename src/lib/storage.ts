import { CartItem } from './types';
import { validateCartData } from './cart-utils';

const CART_KEY = 'ecommerce-cart';

export interface StoredCartData {
  items: CartItem[];
  promotionCode: string | null;
}

export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Loads cart data from localStorage.
 * Supports both the new { items, promotionCode } format and the
 * legacy items-only array format for backward compatibility.
 */
export function loadCart(): StoredCartData | null {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return validateStoredCartData(parsed);
  } catch {
    return null;
  }
}

export function saveCart(items: CartItem[], promotionCode: string | null): void {
  try {
    const data: StoredCartData = { items, promotionCode };
    localStorage.setItem(CART_KEY, JSON.stringify(data));
  } catch {
    // Silent failure when storage is unavailable
  }
}

export function clearCart(): void {
  try {
    localStorage.removeItem(CART_KEY);
  } catch {
    // Silent failure when storage is unavailable
  }
}

export function validateStoredCartData(data: unknown): StoredCartData | null {
  if (data === null || data === undefined) return null;

  // Legacy format: bare array of CartItem[]
  if (Array.isArray(data)) {
    const items = validateCartData(data);
    if (!items) return null;
    return { items, promotionCode: null };
  }

  // New format: { items, promotionCode }
  if (typeof data === 'object' && 'items' in data) {
    const obj = data as Record<string, unknown>;
    const items = validateCartData(obj.items);
    if (!items) return null;
    const promotionCode =
      typeof obj.promotionCode === 'string' ? obj.promotionCode : null;
    return { items, promotionCode };
  }

  return null;
}
