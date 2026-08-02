import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, loadDb, saveDb } from '@/lib/db/store';
import { getWishlist, addToWishlist, removeFromWishlist } from '@/lib/services/wishlist-service';
import { NotFoundError } from '@/lib/errors';

function seedProducts() {
  const db = loadDb();
  const now = new Date().toISOString();
  db.products.push(
    { id: 'p1', name: 'Widget', slug: 'widget', description: 'A widget', price: 1999, compareAtPrice: null, category: 'Tools', images: ['/img.jpg'], specifications: {}, tags: [], featured: false, status: 'active', stock: 10, lowStockThreshold: 3, createdAt: now, updatedAt: now },
    { id: 'p2', name: 'Gadget', slug: 'gadget', description: 'A gadget', price: 4999, compareAtPrice: null, category: 'Electronics', images: ['/img2.jpg'], specifications: {}, tags: [], featured: false, status: 'active', stock: 5, lowStockThreshold: 2, createdAt: now, updatedAt: now },
    { id: 'p3', name: 'Archived', slug: 'archived', description: 'Old', price: 500, compareAtPrice: null, category: 'Tools', images: [], specifications: {}, tags: [], featured: false, status: 'archived', stock: 10, lowStockThreshold: 5, createdAt: now, updatedAt: now },
  );
  saveDb(db);
}

beforeEach(() => {
  resetDb();
  seedProducts();
});

describe('getWishlist', () => {
  it('returns empty for new user', () => {
    expect(getWishlist('user-1')).toEqual([]);
  });

  it('returns items with product details after adding', () => {
    addToWishlist('user-1', 'p1');
    const wishlist = getWishlist('user-1');
    expect(wishlist).toHaveLength(1);
    expect(wishlist[0].productName).toBe('Widget');
    expect(wishlist[0].productPrice).toBe(1999);
  });

  it('excludes archived products', () => {
    const db = loadDb();
    db.wishlistItems.push({ id: 'wi-1', userId: 'user-1', productId: 'p3', addedAt: new Date().toISOString() });
    saveDb(db);
    const wishlist = getWishlist('user-1');
    expect(wishlist).toHaveLength(0);
  });

  it('sorts by newest first', () => {
    addToWishlist('user-1', 'p1');
    addToWishlist('user-1', 'p2');
    const wishlist = getWishlist('user-1');
    expect(wishlist[0].productId).toBe('p2'); // added last
  });
});

describe('addToWishlist', () => {
  it('adds a product to wishlist', () => {
    const result = addToWishlist('user-1', 'p1');
    expect(result).toHaveLength(1);
    expect(result[0].productId).toBe('p1');
  });

  it('throws NotFoundError for non-existent product', () => {
    expect(() => addToWishlist('user-1', 'nonexistent')).toThrow(NotFoundError);
  });

  it('throws NotFoundError for archived product', () => {
    expect(() => addToWishlist('user-1', 'p3')).toThrow(NotFoundError);
  });

  it('is idempotent - adding same product twice does not duplicate', () => {
    addToWishlist('user-1', 'p1');
    const result = addToWishlist('user-1', 'p1');
    expect(result).toHaveLength(1);
  });

  it('allows different users to wishlist same product', () => {
    addToWishlist('user-1', 'p1');
    addToWishlist('user-2', 'p1');
    expect(getWishlist('user-1')).toHaveLength(1);
    expect(getWishlist('user-2')).toHaveLength(1);
  });
});

describe('removeFromWishlist', () => {
  it('removes a product from wishlist', () => {
    addToWishlist('user-1', 'p1');
    addToWishlist('user-1', 'p2');
    const result = removeFromWishlist('user-1', 'p1');
    expect(result).toHaveLength(1);
    expect(result[0].productId).toBe('p2');
  });

  it('does not throw when removing non-wishlisted product', () => {
    expect(() => removeFromWishlist('user-1', 'p999')).not.toThrow();
  });

  it('does not affect other users wishlist', () => {
    addToWishlist('user-1', 'p1');
    addToWishlist('user-2', 'p1');
    removeFromWishlist('user-1', 'p1');
    expect(getWishlist('user-2')).toHaveLength(1);
  });
});
