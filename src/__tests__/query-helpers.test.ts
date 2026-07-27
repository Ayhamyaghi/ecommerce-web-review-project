import { describe, it, expect } from 'vitest';
import {
  findProductById,
  findActiveProductById,
  paginate,
  appendInventoryLog,
  generateOrderId,
} from '@/lib/db/query-helpers';
import type { DbSchema, DbProduct } from '@/lib/db/store';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeProduct(overrides: Partial<DbProduct> = {}): DbProduct {
  return {
    id: 'prod-1',
    name: 'Widget',
    slug: 'widget',
    description: 'A test widget',
    price: 1000,
    compareAtPrice: null,
    category: 'Tools',
    images: ['https://example.com/img.jpg'],
    specifications: {},
    tags: [],
    featured: false,
    status: 'active',
    stock: 10,
    lowStockThreshold: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    ...overrides,
  };
}

function makeDb(overrides: Partial<DbSchema> = {}): DbSchema {
  return {
    users: [],
    sessions: [],
    products: [],
    categories: [],
    cartItems: [],
    wishlistItems: [],
    orders: [],
    orderItems: [],
    reviews: [],
    promotions: [],
    promotionUsages: [],
    inventoryLogs: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// findProductById
// ---------------------------------------------------------------------------

describe('findProductById', () => {
  it('returns the product when found', () => {
    const product = makeProduct({ id: 'abc' });
    const db = makeDb({ products: [product] });
    expect(findProductById(db, 'abc')).toBe(product);
  });

  it('returns undefined when not found', () => {
    const db = makeDb({ products: [makeProduct({ id: 'abc' })] });
    expect(findProductById(db, 'xyz')).toBeUndefined();
  });

  it('returns undefined for empty products list', () => {
    const db = makeDb({ products: [] });
    expect(findProductById(db, 'any')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// findActiveProductById
// ---------------------------------------------------------------------------

describe('findActiveProductById', () => {
  it('returns an active product', () => {
    const product = makeProduct({ id: 'p1', status: 'active' });
    const db = makeDb({ products: [product] });
    expect(findActiveProductById(db, 'p1')).toBe(product);
  });

  it('returns undefined for a draft product', () => {
    const product = makeProduct({ id: 'p1', status: 'draft' });
    const db = makeDb({ products: [product] });
    expect(findActiveProductById(db, 'p1')).toBeUndefined();
  });

  it('returns undefined for an archived product', () => {
    const product = makeProduct({ id: 'p1', status: 'archived' });
    const db = makeDb({ products: [product] });
    expect(findActiveProductById(db, 'p1')).toBeUndefined();
  });

  it('returns undefined when id does not match', () => {
    const db = makeDb({ products: [makeProduct({ id: 'p1', status: 'active' })] });
    expect(findActiveProductById(db, 'p2')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// paginate
// ---------------------------------------------------------------------------

describe('paginate', () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('returns the first page', () => {
    const result = paginate(items, 1, 3);
    expect(result.items).toEqual([1, 2, 3]);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(3);
    expect(result.total).toBe(10);
    expect(result.totalPages).toBe(4);
  });

  it('returns a middle page', () => {
    const result = paginate(items, 2, 3);
    expect(result.items).toEqual([4, 5, 6]);
  });

  it('returns the last (partial) page', () => {
    const result = paginate(items, 4, 3);
    expect(result.items).toEqual([10]);
  });

  it('returns an empty items array when page is beyond total', () => {
    const result = paginate(items, 100, 3);
    expect(result.items).toHaveLength(0);
    expect(result.total).toBe(10);
  });

  it('returns all items when pageSize equals array length', () => {
    const result = paginate(items, 1, 10);
    expect(result.items).toEqual(items);
    expect(result.totalPages).toBe(1);
  });

  it('handles empty array', () => {
    const result = paginate([], 1, 10);
    expect(result.items).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.totalPages).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// appendInventoryLog
// ---------------------------------------------------------------------------

describe('appendInventoryLog', () => {
  it('appends a log entry to db.inventoryLogs', () => {
    const db = makeDb();
    appendInventoryLog(db, 'prod-1', 10, 8, 'order_placed', 'order-99');
    expect(db.inventoryLogs).toHaveLength(1);
    const log = db.inventoryLogs[0];
    expect(log.productId).toBe('prod-1');
    expect(log.previousStock).toBe(10);
    expect(log.newStock).toBe(8);
    expect(log.change).toBe(-2);
    expect(log.reason).toBe('order_placed');
    expect(log.referenceId).toBe('order-99');
  });

  it('sets referenceId to null when not provided', () => {
    const db = makeDb();
    appendInventoryLog(db, 'prod-1', 0, 50, 'restock');
    expect(db.inventoryLogs[0].referenceId).toBeNull();
  });

  it('uses the provided timestamp', () => {
    const db = makeDb();
    const ts = '2026-06-01T12:00:00Z';
    appendInventoryLog(db, 'prod-1', 5, 10, 'manual_adjustment', null, ts);
    expect(db.inventoryLogs[0].createdAt).toBe(ts);
  });

  it('accumulates multiple log entries', () => {
    const db = makeDb();
    appendInventoryLog(db, 'prod-1', 10, 8, 'order_placed');
    appendInventoryLog(db, 'prod-1', 8, 6, 'order_placed');
    expect(db.inventoryLogs).toHaveLength(2);
  });

  it('computes positive change for a restock', () => {
    const db = makeDb();
    appendInventoryLog(db, 'prod-1', 5, 20, 'restock');
    expect(db.inventoryLogs[0].change).toBe(15);
  });

  it('returns the created log record', () => {
    const db = makeDb();
    const log = appendInventoryLog(db, 'prod-2', 0, 100, 'initial');
    expect(log).toBe(db.inventoryLogs[0]);
  });
});

// ---------------------------------------------------------------------------
// generateOrderId
// ---------------------------------------------------------------------------

describe('generateOrderId', () => {
  it('starts with "ORD-"', () => {
    expect(generateOrderId()).toMatch(/^ORD-/);
  });

  it('generates unique IDs on successive calls', () => {
    const ids = new Set(Array.from({ length: 20 }, () => generateOrderId()));
    expect(ids.size).toBe(20);
  });

  it('contains only uppercase letters, digits, and hyphens', () => {
    for (let i = 0; i < 10; i++) {
      expect(generateOrderId()).toMatch(/^[A-Z0-9-]+$/);
    }
  });
});
