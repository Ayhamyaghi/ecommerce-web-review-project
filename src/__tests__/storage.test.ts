import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadCart,
  saveCart,
  clearCart,
  isStorageAvailable,
  validateStoredCartData,
} from '@/lib/storage';

beforeEach(() => {
  localStorage.clear();
});

describe('isStorageAvailable', () => {
  it('returns true when localStorage works', () => {
    expect(isStorageAvailable()).toBe(true);
  });

  it('returns false when localStorage throws (EC11)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(isStorageAvailable()).toBe(false);
    spy.mockRestore();
  });
});

describe('saveCart and loadCart', () => {
  it('round-trips cart data with promotion code', () => {
    const items = [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1 },
    ];
    saveCart(items, 'SAVE10');
    const loaded = loadCart();
    expect(loaded).toEqual({ items, promotionCode: 'SAVE10' });
  });

  it('round-trips cart data without promotion code', () => {
    const items = [{ productId: 'p1', quantity: 3 }];
    saveCart(items, null);
    const loaded = loadCart();
    expect(loaded).toEqual({ items, promotionCode: null });
  });

  it('returns null when key does not exist', () => {
    expect(loadCart()).toBeNull();
  });

  it('returns null for malformed JSON (EC8)', () => {
    localStorage.setItem('ecommerce-cart', '{not valid json}');
    expect(loadCart()).toBeNull();
  });

  it('returns null when data fails validation', () => {
    localStorage.setItem('ecommerce-cart', JSON.stringify('not-an-array'));
    expect(loadCart()).toBeNull();
  });

  it('returns null when items have wrong shape', () => {
    localStorage.setItem(
      'ecommerce-cart',
      JSON.stringify({ items: [{ wrong: 'shape' }], promotionCode: null }),
    );
    expect(loadCart()).toBeNull();
  });

  it('silently fails when storage throws on save (EC11)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveCart([{ productId: 'p1', quantity: 1 }], null)).not.toThrow();
    spy.mockRestore();
  });
});

describe('clearCart', () => {
  it('removes the cart key', () => {
    saveCart([{ productId: 'p1', quantity: 1 }], null);
    clearCart();
    expect(loadCart()).toBeNull();
  });

  it('does not throw when storage is unavailable', () => {
    const spy = vi
      .spyOn(Storage.prototype, 'removeItem')
      .mockImplementation(() => {
        throw new Error('SecurityError');
      });
    expect(() => clearCart()).not.toThrow();
    spy.mockRestore();
  });
});

describe('validateStoredCartData', () => {
  it('parses legacy items-only array format', () => {
    const data = [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1 },
    ];
    const result = validateStoredCartData(data);
    expect(result).toEqual({ items: data, promotionCode: null });
  });

  it('parses new format with promotion code', () => {
    const data = {
      items: [{ productId: 'p1', quantity: 2 }],
      promotionCode: 'SAVE10',
    };
    const result = validateStoredCartData(data);
    expect(result).toEqual(data);
  });

  it('handles new format with null promotion code', () => {
    const data = {
      items: [{ productId: 'p1', quantity: 2 }],
      promotionCode: null,
    };
    const result = validateStoredCartData(data);
    expect(result).toEqual({ items: [{ productId: 'p1', quantity: 2 }], promotionCode: null });
  });

  it('treats non-string promotionCode as null', () => {
    const data = {
      items: [{ productId: 'p1', quantity: 1 }],
      promotionCode: 123,
    };
    const result = validateStoredCartData(data);
    expect(result?.promotionCode).toBeNull();
  });

  it('returns null for completely invalid data', () => {
    expect(validateStoredCartData('garbage')).toBeNull();
    expect(validateStoredCartData(42)).toBeNull();
    expect(validateStoredCartData(null)).toBeNull();
    expect(validateStoredCartData(undefined)).toBeNull();
  });

  it('returns null when items in new format are invalid', () => {
    const data = {
      items: [{ wrong: 'shape' }],
      promotionCode: 'SAVE10',
    };
    expect(validateStoredCartData(data)).toBeNull();
  });
});
