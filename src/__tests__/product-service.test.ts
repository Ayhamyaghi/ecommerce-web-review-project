/**
 * Unit tests for the product service layer.
 *
 * The database module is mocked so tests run without filesystem I/O and focus
 * on business logic: filtering, pagination, slug uniqueness, and inventory log
 * creation on stock changes.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as dbStore from '@/lib/db/store';
import type { DbSchema, DbProduct } from '@/lib/db/store';

// ---------------------------------------------------------------------------
// DB mock
// ---------------------------------------------------------------------------

let mockDb: DbSchema;

vi.mock('@/lib/db/store', async (importOriginal) => {
  const actual = await importOriginal<typeof dbStore>();
  return {
    ...actual,
    loadDb: () => mockDb,
    saveDb: (db: DbSchema) => { mockDb = db; },
    generateId: () => `id-${Math.random().toString(36).slice(2)}`,
  };
});

function makeProduct(overrides: Partial<DbProduct> = {}): DbProduct {
  return {
    id: `prod-${Math.random().toString(36).slice(2)}`,
    name: 'Widget',
    slug: 'widget',
    description: 'A great widget',
    price: 1500,
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

function emptyDb(): DbSchema {
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
  };
}

// ---------------------------------------------------------------------------
// Import after mocks
// ---------------------------------------------------------------------------

const { listProducts, getProduct, getRelatedProducts, createProduct, updateProduct, deleteProduct } =
  await import('@/lib/services/product-service');
const { NotFoundError, ConflictError } = await import('@/lib/errors');

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockDb = emptyDb();
});

describe('listProducts — filtering', () => {
  beforeEach(() => {
    mockDb.products = [
      makeProduct({ id: 'p1', name: 'Alpha', slug: 'alpha', status: 'active', category: 'Tools', price: 1000, featured: true }),
      makeProduct({ id: 'p2', name: 'Beta', slug: 'beta', status: 'active', category: 'Electronics', price: 3000, featured: false }),
      makeProduct({ id: 'p3', name: 'Gamma', slug: 'gamma', status: 'draft', category: 'Tools', price: 2000, featured: false }),
    ];
  });

  it('only returns active products by default', () => {
    const result = listProducts({ sort: 'relevance', page: 1, pageSize: 10, search: '' });
    expect(result.products).toHaveLength(2);
    expect(result.products.every(p => p.status === 'active')).toBe(true);
  });

  it('can return draft products when status filter is set', () => {
    const result = listProducts({ sort: 'relevance', page: 1, pageSize: 10, search: '', status: 'draft' });
    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe('p3');
  });

  it('filters by category', () => {
    const result = listProducts({ sort: 'relevance', page: 1, pageSize: 10, search: '', category: 'Tools' });
    expect(result.products.every(p => p.category === 'Tools')).toBe(true);
  });

  it('filters by search term (name match)', () => {
    const result = listProducts({ sort: 'relevance', page: 1, pageSize: 10, search: 'alpha' });
    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe('p1');
  });

  it('filters by minPrice', () => {
    const result = listProducts({ sort: 'relevance', page: 1, pageSize: 10, search: '', minPrice: 2000 });
    expect(result.products.every(p => p.price >= 2000)).toBe(true);
  });

  it('filters by featured flag', () => {
    const result = listProducts({ sort: 'relevance', page: 1, pageSize: 10, search: '', featured: true });
    expect(result.products.every(p => p.featured)).toBe(true);
  });
});

describe('listProducts — sorting', () => {
  beforeEach(() => {
    mockDb.products = [
      makeProduct({ id: 'p1', name: 'Beta', slug: 'beta', price: 3000 }),
      makeProduct({ id: 'p2', name: 'Alpha', slug: 'alpha', price: 1000 }),
      makeProduct({ id: 'p3', name: 'Gamma', slug: 'gamma', price: 2000 }),
    ];
  });

  it('sorts by price ascending', () => {
    const result = listProducts({ sort: 'price-asc', page: 1, pageSize: 10, search: '' });
    expect(result.products.map(p => p.id)).toEqual(['p2', 'p3', 'p1']);
  });

  it('sorts by price descending', () => {
    const result = listProducts({ sort: 'price-desc', page: 1, pageSize: 10, search: '' });
    expect(result.products.map(p => p.id)).toEqual(['p1', 'p3', 'p2']);
  });

  it('sorts by name ascending', () => {
    const result = listProducts({ sort: 'name-asc', page: 1, pageSize: 10, search: '' });
    expect(result.products.map(p => p.name)).toEqual(['Alpha', 'Beta', 'Gamma']);
  });
});

describe('listProducts — pagination', () => {
  beforeEach(() => {
    mockDb.products = Array.from({ length: 5 }, (_, i) =>
      makeProduct({ id: `p${i}`, name: `Product ${i}`, slug: `product-${i}` }),
    );
  });

  it('returns correct page metadata', () => {
    const result = listProducts({ sort: 'relevance', page: 1, pageSize: 2, search: '' });
    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
    expect(result.products).toHaveLength(2);
  });

  it('returns the second page', () => {
    const result = listProducts({ sort: 'name-asc', page: 2, pageSize: 2, search: '' });
    expect(result.products).toHaveLength(2);
    expect(result.page).toBe(2);
  });
});

describe('getProduct', () => {
  it('finds a product by ID', () => {
    mockDb.products = [makeProduct({ id: 'abc', slug: 'some-slug' })];
    const p = getProduct('abc');
    expect(p.id).toBe('abc');
  });

  it('finds a product by slug', () => {
    mockDb.products = [makeProduct({ id: 'xyz', slug: 'my-slug' })];
    const p = getProduct('my-slug');
    expect(p.id).toBe('xyz');
  });

  it('throws NotFoundError for an unknown id/slug', () => {
    mockDb.products = [];
    expect(() => getProduct('ghost')).toThrow(NotFoundError);
  });
});

describe('getRelatedProducts', () => {
  it('returns products from the same category excluding the source', () => {
    mockDb.products = [
      makeProduct({ id: 'p1', slug: 'p1', category: 'Tools' }),
      makeProduct({ id: 'p2', slug: 'p2', category: 'Tools' }),
      makeProduct({ id: 'p3', slug: 'p3', category: 'Electronics' }),
    ];
    const related = getRelatedProducts('p1');
    expect(related.every(p => p.category === 'Tools')).toBe(true);
    expect(related.some(p => p.id === 'p1')).toBe(false);
  });

  it('returns empty array when product does not exist', () => {
    mockDb.products = [];
    expect(getRelatedProducts('ghost')).toHaveLength(0);
  });
});

describe('createProduct', () => {
  it('creates a product and appends an inventory log', () => {
    const input = {
      name: 'New Widget',
      slug: 'new-widget',
      description: 'A brand new widget product',
      price: 2500,
      category: 'Tools',
      images: ['https://example.com/new.jpg'],
      specifications: {},
      tags: [],
      featured: false,
      status: 'active' as const,
      stock: 20,
      lowStockThreshold: 5,
    };
    const product = createProduct(input);
    expect(product.name).toBe('New Widget');
    expect(mockDb.products).toHaveLength(1);
    // An inventory log should be written for the initial stock
    expect(mockDb.inventoryLogs).toHaveLength(1);
    expect(mockDb.inventoryLogs[0].reason).toBe('initial');
    expect(mockDb.inventoryLogs[0].newStock).toBe(20);
  });

  it('throws ConflictError when the slug already exists', () => {
    mockDb.products = [makeProduct({ slug: 'taken-slug' })];
    expect(() =>
      createProduct({
        name: 'Duplicate',
        slug: 'taken-slug',
        description: 'Trying to use an existing slug',
        price: 1000,
        category: 'Tools',
        images: ['https://example.com/img.jpg'],
        specifications: {},
        tags: [],
        featured: false,
        status: 'active',
        stock: 0,
        lowStockThreshold: 5,
      }),
    ).toThrow(ConflictError);
  });
});

describe('updateProduct', () => {
  it('updates fields and records an inventory log on stock change', () => {
    mockDb.products = [makeProduct({ id: 'p1', slug: 'widget', stock: 10 })];
    const updated = updateProduct('p1', { stock: 25 });
    expect(updated.stock).toBe(25);
    expect(mockDb.inventoryLogs).toHaveLength(1);
    expect(mockDb.inventoryLogs[0].reason).toBe('manual_adjustment');
    expect(mockDb.inventoryLogs[0].change).toBe(15);
  });

  it('does not append an inventory log when stock is unchanged', () => {
    mockDb.products = [makeProduct({ id: 'p1', slug: 'widget', stock: 10 })];
    updateProduct('p1', { name: 'Updated Widget' });
    expect(mockDb.inventoryLogs).toHaveLength(0);
  });

  it('throws NotFoundError for a non-existent product', () => {
    expect(() => updateProduct('ghost', { name: 'Ghost' })).toThrow(NotFoundError);
  });

  it('throws ConflictError when the new slug is already taken', () => {
    mockDb.products = [
      makeProduct({ id: 'p1', slug: 'slug-1' }),
      makeProduct({ id: 'p2', slug: 'slug-2' }),
    ];
    expect(() => updateProduct('p1', { slug: 'slug-2' })).toThrow(ConflictError);
  });
});

describe('deleteProduct', () => {
  it('archives the product rather than removing it', () => {
    mockDb.products = [makeProduct({ id: 'p1', slug: 'widget', status: 'active' })];
    deleteProduct('p1');
    expect(mockDb.products[0].status).toBe('archived');
  });

  it('throws NotFoundError for a non-existent product', () => {
    mockDb.products = [];
    expect(() => deleteProduct('ghost')).toThrow(NotFoundError);
  });
});
