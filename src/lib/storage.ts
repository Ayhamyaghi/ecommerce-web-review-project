import { CartItem } from './types';
import { validateCartData } from './cart-utils';

const CART_KEY = 'ecommerce-cart';

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

export function loadCart(): CartItem[] | null {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return validateCartData(parsed);
  } catch {
    return null;
  }
}

export function saveCart(items: CartItem[]): void {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
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
