import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, loadDb, saveDb } from '@/lib/db/store';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart, mergeGuestCart } from '@/lib/services/cart-service';
import { NotFoundError, StockLimitError } from '@/lib/errors';

function seedProducts() {
  const db = loadDb();
  db.products.push(
    { id: 'p1', name: 'Widget', slug: 'widget', description: 'A widget', price: 1999, compareAtPrice: null, category: 'Tools', images: ['/img.jpg'], specifications: {}, tags: [], featured: false, status: 'active', stock: 10, lowStockThreshold: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'p2', name: 'Gadget', slug: 'gadget', description: 'A gadget', price: 4999, compareAtPrice: null, category: 'Electronics', images: ['/img2.jpg'], specifications: {}, tags: [], featured: false, status: 'active', stock: 5, lowStockThreshold: 2, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'p3', name: 'Out of Stock', slug: 'oos', description: 'Gone', price: 999, compareAtPrice: null, category: 'Tools', images: [], specifications: {}, tags: [], featured: false, status: 'active', stock: 0, lowStockThreshold: 5, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'p4', name: 'Archived', slug: 'archived', description: 'Old', price: 500, compareAtPrice: null, category: 'Tools', images: [], specifications: {}, tags: [], featured: false, status: 'archived', stock: 10, lowStockThreshold: 5, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  );
  saveDb(db);
}

beforeEach(() => {
  resetDb();
  seedProducts();
});

describe('getCart', () => {
  it('returns empty cart for new session', () => {
    const cart = getCart('session-1');
    expect(cart.items).toEqual([]);
    expect(cart.subtotal).toBe(0);
    expect(cart.itemCount).toBe(0);
  });

  it('returns items with product details', () => {
    addToCart('session-1', 'p1', 2);
    const cart = getCart('session-1');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productName).toBe('Widget');
    expect(cart.items[0].price).toBe(1999);
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.items[0].subtotal).toBe(3998);
  });

  it('caps quantity at stock level when reading', () => {
    addToCart('session-1', 'p2', 5);
    // Reduce stock externally
    const db = loadDb();
    db.products.find(p => p.id === 'p2')!.stock = 2;
    saveDb(db);
    const cart = getCart('session-1');
    expect(cart.items[0].quantity).toBe(2);
  });

  it('excludes archived products', () => {
    const db = loadDb();
    db.cartItems.push({ id: 'ci-1', sessionId: 'session-1', productId: 'p4', quantity: 1, addedAt: new Date().toISOString() });
    saveDb(db);
    const cart = getCart('session-1');
    expect(cart.items).toHaveLength(0);
  });

  it('excludes items where stock dropped to zero', () => {
    addToCart('session-1', 'p1', 2);
    const db = loadDb();
    db.products.find(p => p.id === 'p1')!.stock = 0;
    saveDb(db);
    const cart = getCart('session-1');
    expect(cart.items).toHaveLength(0);
  });
});

describe('addToCart', () => {
  it('adds a new product to cart', () => {
    const cart = addToCart('session-1', 'p1', 3);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(3);
    expect(cart.subtotal).toBe(5997);
  });

  it('increments quantity for existing item', () => {
    addToCart('session-1', 'p1', 2);
    const cart = addToCart('session-1', 'p1', 3);
    expect(cart.items[0].quantity).toBe(5);
  });

  it('throws NotFoundError for non-existent product', () => {
    expect(() => addToCart('session-1', 'nonexistent', 1)).toThrow(NotFoundError);
  });

  it('throws NotFoundError for archived product', () => {
    expect(() => addToCart('session-1', 'p4', 1)).toThrow(NotFoundError);
  });

  it('throws StockLimitError for out-of-stock product', () => {
    expect(() => addToCart('session-1', 'p3', 1)).toThrow(StockLimitError);
  });

  it('throws StockLimitError when quantity exceeds stock for new item', () => {
    expect(() => addToCart('session-1', 'p2', 6)).toThrow(StockLimitError);
  });

  it('throws StockLimitError when combined quantity exceeds stock', () => {
    addToCart('session-1', 'p2', 3);
    expect(() => addToCart('session-1', 'p2', 3)).toThrow(StockLimitError);
  });

  it('allows adding up to exact stock level', () => {
    const cart = addToCart('session-1', 'p2', 5);
    expect(cart.items[0].quantity).toBe(5);
  });
});

describe('updateCartItem', () => {
  it('updates quantity of existing item', () => {
    addToCart('session-1', 'p1', 2);
    const cart = updateCartItem('session-1', 'p1', 5);
    expect(cart.items[0].quantity).toBe(5);
  });

  it('removes item when quantity is set to 0', () => {
    addToCart('session-1', 'p1', 2);
    const cart = updateCartItem('session-1', 'p1', 0);
    expect(cart.items).toHaveLength(0);
  });

  it('throws NotFoundError for non-existent product', () => {
    expect(() => updateCartItem('session-1', 'nonexistent', 1)).toThrow(NotFoundError);
  });

  it('throws NotFoundError when cart item does not exist', () => {
    expect(() => updateCartItem('session-1', 'p1', 5)).toThrow(NotFoundError);
  });

  it('throws StockLimitError when quantity exceeds stock', () => {
    addToCart('session-1', 'p2', 1);
    expect(() => updateCartItem('session-1', 'p2', 6)).toThrow(StockLimitError);
  });
});

describe('removeCartItem', () => {
  it('removes the item from cart', () => {
    addToCart('session-1', 'p1', 2);
    addToCart('session-1', 'p2', 1);
    const cart = removeCartItem('session-1', 'p1');
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].productId).toBe('p2');
  });

  it('returns empty cart when removing the last item', () => {
    addToCart('session-1', 'p1', 1);
    const cart = removeCartItem('session-1', 'p1');
    expect(cart.items).toHaveLength(0);
    expect(cart.subtotal).toBe(0);
  });

  it('does not throw when removing non-existent item', () => {
    expect(() => removeCartItem('session-1', 'p999')).not.toThrow();
  });
});

describe('clearCart', () => {
  it('removes all items for the session', () => {
    addToCart('session-1', 'p1', 2);
    addToCart('session-1', 'p2', 1);
    clearCart('session-1');
    const cart = getCart('session-1');
    expect(cart.items).toHaveLength(0);
  });

  it('does not affect other sessions', () => {
    addToCart('session-1', 'p1', 1);
    addToCart('session-2', 'p2', 1);
    clearCart('session-1');
    const cart2 = getCart('session-2');
    expect(cart2.items).toHaveLength(1);
  });
});

describe('mergeGuestCart', () => {
  it('moves guest items to user session', () => {
    addToCart('guest-session', 'p1', 2);
    mergeGuestCart('guest-session', 'user-session');
    const guestCart = getCart('guest-session');
    const userCart = getCart('user-session');
    expect(guestCart.items).toHaveLength(0);
    expect(userCart.items).toHaveLength(1);
    expect(userCart.items[0].quantity).toBe(2);
  });

  it('merges quantities when same product exists in both carts', () => {
    addToCart('guest-session', 'p1', 2);
    addToCart('user-session', 'p1', 3);
    mergeGuestCart('guest-session', 'user-session');
    const userCart = getCart('user-session');
    expect(userCart.items[0].quantity).toBe(5);
  });

  it('caps merged quantity at stock level', () => {
    addToCart('guest-session', 'p2', 3);
    addToCart('user-session', 'p2', 4);
    mergeGuestCart('guest-session', 'user-session');
    const userCart = getCart('user-session');
    expect(userCart.items[0].quantity).toBe(5); // stock is 5
  });
});
