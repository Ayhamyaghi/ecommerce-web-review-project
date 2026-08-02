import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, loadDb, saveDb } from '@/lib/db/store';
import { getInventory, adjustStock, getInventoryStats } from '@/lib/services/inventory-service';
import { NotFoundError, ValidationError } from '@/lib/errors';

function seedProducts() {
  const db = loadDb();
  const now = new Date().toISOString();
  db.products.push(
    { id: 'p1', name: 'Widget', slug: 'widget', description: 'A widget', price: 1999, compareAtPrice: null, category: 'Tools', images: [], specifications: {}, tags: [], featured: false, status: 'active', stock: 10, lowStockThreshold: 5, createdAt: now, updatedAt: now },
    { id: 'p2', name: 'Gadget', slug: 'gadget', description: 'A gadget', price: 4999, compareAtPrice: null, category: 'Electronics', images: [], specifications: {}, tags: [], featured: false, status: 'active', stock: 3, lowStockThreshold: 5, createdAt: now, updatedAt: now },
    { id: 'p3', name: 'Out of Stock', slug: 'oos', description: 'Empty', price: 999, compareAtPrice: null, category: 'Tools', images: [], specifications: {}, tags: [], featured: false, status: 'active', stock: 0, lowStockThreshold: 5, createdAt: now, updatedAt: now },
    { id: 'p4', name: 'Archived', slug: 'archived', description: 'Old', price: 500, compareAtPrice: null, category: 'Tools', images: [], specifications: {}, tags: [], featured: false, status: 'archived', stock: 10, lowStockThreshold: 5, createdAt: now, updatedAt: now },
  );
  saveDb(db);
}

beforeEach(() => {
  resetDb();
  seedProducts();
});

describe('getInventory', () => {
  it('returns inventory info for a product', () => {
    const info = getInventory('p1');
    expect(info.product.id).toBe('p1');
    expect(info.product.stock).toBe(10);
    expect(info.product.isLowStock).toBe(false); // 10 > 5
    expect(info.product.isOutOfStock).toBe(false);
  });

  it('flags low stock correctly', () => {
    const info = getInventory('p2'); // stock 3, threshold 5
    expect(info.product.isLowStock).toBe(true);
    expect(info.product.isOutOfStock).toBe(false);
  });

  it('flags out of stock correctly', () => {
    const info = getInventory('p3');
    expect(info.product.isOutOfStock).toBe(true);
    expect(info.product.isLowStock).toBe(false); // out of stock is not low stock
  });

  it('throws NotFoundError for unknown product', () => {
    expect(() => getInventory('nonexistent')).toThrow(NotFoundError);
  });

  it('returns inventory logs sorted by newest', () => {
    adjustStock('p1', 15);
    adjustStock('p1', 20);
    const info = getInventory('p1');
    expect(info.logs.length).toBeGreaterThanOrEqual(2);
    for (let i = 1; i < info.logs.length; i++) {
      expect(info.logs[i - 1].createdAt >= info.logs[i].createdAt).toBe(true);
    }
  });
});

describe('adjustStock', () => {
  it('adjusts stock and returns updated info', () => {
    const info = adjustStock('p1', 20);
    expect(info.product.stock).toBe(20);
  });

  it('creates an inventory log', () => {
    adjustStock('p1', 20);
    const info = getInventory('p1');
    const log = info.logs.find(l => l.reason === 'manual_adjustment');
    expect(log).toBeTruthy();
    expect(log!.previousStock).toBe(10);
    expect(log!.newStock).toBe(20);
    expect(log!.change).toBe(10);
  });

  it('allows setting stock to 0', () => {
    const info = adjustStock('p1', 0);
    expect(info.product.stock).toBe(0);
    expect(info.product.isOutOfStock).toBe(true);
  });

  it('throws ValidationError for negative stock', () => {
    expect(() => adjustStock('p1', -1)).toThrow(ValidationError);
  });

  it('throws NotFoundError for unknown product', () => {
    expect(() => adjustStock('nonexistent', 10)).toThrow(NotFoundError);
  });

  it('supports restock reason', () => {
    adjustStock('p3', 50, 'restock');
    const info = getInventory('p3');
    const log = info.logs.find(l => l.reason === 'restock');
    expect(log).toBeTruthy();
  });

  it('supports reference id', () => {
    adjustStock('p1', 5, 'manual_adjustment', 'ref-123');
    const info = getInventory('p1');
    const log = info.logs.find(l => l.referenceId === 'ref-123');
    expect(log).toBeTruthy();
  });
});

describe('getInventoryStats', () => {
  it('returns aggregate stats for active products', () => {
    const stats = getInventoryStats();
    expect(stats.totalProducts).toBe(3); // p4 is archived
    expect(stats.totalStock).toBe(13); // 10 + 3 + 0
    expect(stats.outOfStock).toBe(1); // p3
    expect(stats.lowStock).toBe(1); // p2 (3 <= 5, but > 0)
    expect(stats.inStock).toBe(1); // p1 (10 > 5)
  });

  it('updates after stock adjustment', () => {
    adjustStock('p3', 10);
    const stats = getInventoryStats();
    expect(stats.outOfStock).toBe(0);
    expect(stats.totalStock).toBe(23); // 10 + 3 + 10
  });
});
