import { describe, it, expect, beforeEach, vi } from 'vitest';
import { loadCart, saveCart, clearCart, isStorageAvailable } from '@/lib/storage';

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
  it('round-trips cart data', () => {
    const items = [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1 },
    ];
    saveCart(items);
    expect(loadCart()).toEqual(items);
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
      JSON.stringify([{ wrong: 'shape' }]),
    );
    expect(loadCart()).toBeNull();
  });

  it('silently fails when storage throws on save (EC11)', () => {
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    expect(() => saveCart([{ productId: 'p1', quantity: 1 }])).not.toThrow();
    spy.mockRestore();
  });
});

describe('clearCart', () => {
  it('removes the cart key', () => {
    saveCart([{ productId: 'p1', quantity: 1 }]);
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
