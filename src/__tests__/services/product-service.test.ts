import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, loadDb, saveDb } from '@/lib/db/store';
import {
  listProducts,
  getProduct,
  getRelatedProducts,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '@/lib/services/product-service';
import { NotFoundError, ConflictError } from '@/lib/errors';
import { createProductSchema } from '@/lib/schemas/product';

function seedProducts() {
  const db = loadDb();
  const now = new Date().toISOString();
  db.products.push(
    { id: 'p1', name: 'Alpha Widget', slug: 'alpha-widget', description: 'First widget', price: 1999, compareAtPrice: null, category: 'Tools', images: ['/a.jpg'], specifications: {}, tags: ['useful'], featured: true, status: 'active', stock: 10, lowStockThreshold: 3, createdAt: '2024-01-01T00:00:00Z', updatedAt: now },
    { id: 'p2', name: 'Beta Gadget', slug: 'beta-gadget', description: 'Second gadget', price: 4999, compareAtPrice: null, category: 'Electronics', images: ['/b.jpg'], specifications: {}, tags: ['tech'], featured: false, status: 'active', stock: 5, lowStockThreshold: 2, createdAt: '2024-02-01T00:00:00Z', updatedAt: now },
    { id: 'p3', name: 'Gamma Gizmo', slug: 'gamma-gizmo', description: 'Third gizmo', price: 2999, compareAtPrice: null, category: 'Electronics', images: ['/c.jpg'], specifications: {}, tags: ['tech'], featured: true, status: 'active', stock: 0, lowStockThreshold: 5, createdAt: '2024-03-01T00:00:00Z', updatedAt: now },
    { id: 'p4', name: 'Delta Draft', slug: 'delta-draft', description: 'A draft product', price: 999, compareAtPrice: null, category: 'Tools', images: ['/d.jpg'], specifications: {}, tags: [], featured: false, status: 'draft', stock: 20, lowStockThreshold: 5, createdAt: '2024-04-01T00:00:00Z', updatedAt: now },
    { id: 'p5', name: 'Epsilon Archived', slug: 'epsilon-archived', description: 'An archived product', price: 500, compareAtPrice: null, category: 'Tools', images: ['/e.jpg'], specifications: {}, tags: [], featured: false, status: 'archived', stock: 0, lowStockThreshold: 5, createdAt: '2024-05-01T00:00:00Z', updatedAt: now },
  );
  db.categories.push(
    { id: 'cat-1', name: 'Tools', slug: 'tools', description: 'Tool category', image: '/cat.jpg' },
    { id: 'cat-2', name: 'Electronics', slug: 'electronics', description: 'Electronics', image: '/cat2.jpg' },
  );
  saveDb(db);
}

beforeEach(() => {
  resetDb();
  seedProducts();
});

describe('listProducts', () => {
  it('returns only active products by default', () => {
    const result = listProducts({ search: '', sort: 'relevance', page: 1, pageSize: 20 });
    expect(result.products.every(p => p.status === 'active')).toBe(true);
    expect(result.products).toHaveLength(3);
  });

  it('filters by category', () => {
    const result = listProducts({ search: '', category: 'Electronics', sort: 'relevance', page: 1, pageSize: 20 });
    expect(result.products.every(p => p.category === 'Electronics')).toBe(true);
    expect(result.products).toHaveLength(2);
  });

  it('searches by name', () => {
    const result = listProducts({ search: 'alpha', sort: 'relevance', page: 1, pageSize: 20 });
    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe('p1');
  });

  it('searches by description', () => {
    const result = listProducts({ search: 'gizmo', sort: 'relevance', page: 1, pageSize: 20 });
    expect(result.products).toHaveLength(1);
  });

  it('searches by tag', () => {
    const result = listProducts({ search: 'tech', sort: 'relevance', page: 1, pageSize: 20 });
    expect(result.products).toHaveLength(2);
  });

  it('filters by price range', () => {
    const result = listProducts({ search: '', minPrice: 2000, maxPrice: 5000, sort: 'relevance', page: 1, pageSize: 20 });
    expect(result.products.every(p => p.price >= 2000 && p.price <= 5000)).toBe(true);
  });

  it('sorts by price ascending', () => {
    const result = listProducts({ search: '', sort: 'price-asc', page: 1, pageSize: 20 });
    for (let i = 1; i < result.products.length; i++) {
      expect(result.products[i].price).toBeGreaterThanOrEqual(result.products[i - 1].price);
    }
  });

  it('sorts by price descending', () => {
    const result = listProducts({ search: '', sort: 'price-desc', page: 1, pageSize: 20 });
    for (let i = 1; i < result.products.length; i++) {
      expect(result.products[i].price).toBeLessThanOrEqual(result.products[i - 1].price);
    }
  });

  it('sorts by name ascending', () => {
    const result = listProducts({ search: '', sort: 'name-asc', page: 1, pageSize: 20 });
    expect(result.products[0].name).toBe('Alpha Widget');
  });

  it('sorts by name descending', () => {
    const result = listProducts({ search: '', sort: 'name-desc', page: 1, pageSize: 20 });
    expect(result.products[0].name).toBe('Gamma Gizmo');
  });

  it('sorts by newest', () => {
    const result = listProducts({ search: '', sort: 'newest', page: 1, pageSize: 20 });
    expect(result.products[0].id).toBe('p3'); // newest createdAt
  });

  it('relevance sort puts featured first', () => {
    const result = listProducts({ search: '', sort: 'relevance', page: 1, pageSize: 20 });
    const firstNonFeaturedIdx = result.products.findIndex(p => !p.featured);
    const lastFeaturedIdx = result.products.length - 1 - [...result.products].reverse().findIndex(p => p.featured);
    if (firstNonFeaturedIdx !== -1 && lastFeaturedIdx !== -1) {
      expect(firstNonFeaturedIdx).toBeGreaterThan(lastFeaturedIdx);
    }
  });

  it('filters by featured', () => {
    const result = listProducts({ search: '', sort: 'relevance', page: 1, pageSize: 20, featured: true });
    expect(result.products.every(p => p.featured)).toBe(true);
    expect(result.products).toHaveLength(2);
  });

  it('filters by status', () => {
    const result = listProducts({ search: '', sort: 'relevance', page: 1, pageSize: 20, status: 'draft' });
    expect(result.products).toHaveLength(1);
    expect(result.products[0].id).toBe('p4');
  });

  it('paginates correctly', () => {
    const result = listProducts({ search: '', sort: 'name-asc', page: 1, pageSize: 2 });
    expect(result.products).toHaveLength(2);
    expect(result.total).toBe(3);
    expect(result.totalPages).toBe(2);
  });

  it('returns categories from all active products', () => {
    const result = listProducts({ search: '', sort: 'relevance', page: 1, pageSize: 20 });
    expect(result.categories).toContain('Tools');
    expect(result.categories).toContain('Electronics');
  });
});

describe('getProduct', () => {
  it('finds product by id', () => {
    const p = getProduct('p1');
    expect(p.name).toBe('Alpha Widget');
  });

  it('finds product by slug', () => {
    const p = getProduct('beta-gadget');
    expect(p.id).toBe('p2');
  });

  it('throws NotFoundError for unknown id/slug', () => {
    expect(() => getProduct('nonexistent')).toThrow(NotFoundError);
  });
});

describe('getRelatedProducts', () => {
  it('returns products from the same category', () => {
    const related = getRelatedProducts('p2'); // Electronics
    expect(related.every(p => p.category === 'Electronics')).toBe(true);
  });

  it('excludes the source product', () => {
    const related = getRelatedProducts('p2');
    expect(related.every(p => p.id !== 'p2')).toBe(true);
  });

  it('only returns active products', () => {
    const related = getRelatedProducts('p1'); // Tools - p4 is draft, p5 is archived
    expect(related.every(p => p.status === 'active')).toBe(true);
  });

  it('respects limit', () => {
    const related = getRelatedProducts('p2', 1);
    expect(related).toHaveLength(1);
  });

  it('returns empty for unknown product', () => {
    expect(getRelatedProducts('nonexistent')).toEqual([]);
  });
});

describe('getFeaturedProducts', () => {
  it('returns only featured active products', () => {
    const featured = getFeaturedProducts();
    expect(featured.every(p => p.featured && p.status === 'active')).toBe(true);
    expect(featured).toHaveLength(2);
  });

  it('respects limit', () => {
    const featured = getFeaturedProducts(1);
    expect(featured).toHaveLength(1);
  });
});

describe('createProduct', () => {
  it('creates a product', () => {
    const input = createProductSchema.parse({
      name: 'New Product',
      slug: 'new-product',
      description: 'A brand new product for testing purposes',
      price: 2999,
      category: 'Tools',
      images: ['https://example.com/img.jpg'],
    });
    const product = createProduct(input);
    expect(product.id).toBeTruthy();
    expect(product.status).toBe('active');
  });

  it('throws ConflictError for duplicate slug', () => {
    const input = createProductSchema.parse({
      name: 'Duplicate',
      slug: 'alpha-widget',
      description: 'Same slug as existing product',
      price: 1000,
      category: 'Tools',
      images: ['https://example.com/img.jpg'],
    });
    expect(() => createProduct(input)).toThrow(ConflictError);
  });

  it('creates inventory log for initial stock', () => {
    const input = createProductSchema.parse({
      name: 'Stocked Product',
      slug: 'stocked-product',
      description: 'Product with initial stock',
      price: 1500,
      category: 'Tools',
      images: ['https://example.com/img.jpg'],
      stock: 50,
    });
    createProduct(input);
    const db = loadDb();
    const log = db.inventoryLogs.find(l => l.reason === 'initial' && l.newStock === 50);
    expect(log).toBeTruthy();
  });
});

describe('updateProduct', () => {
  it('updates product fields', () => {
    const updated = updateProduct('p1', { name: 'Updated Widget', price: 2499 });
    expect(updated.name).toBe('Updated Widget');
    expect(updated.price).toBe(2499);
  });

  it('throws NotFoundError for unknown id', () => {
    expect(() => updateProduct('nonexistent', { name: 'test' })).toThrow(NotFoundError);
  });

  it('throws ConflictError for duplicate slug', () => {
    expect(() => updateProduct('p1', { slug: 'beta-gadget' })).toThrow(ConflictError);
  });

  it('allows keeping the same slug', () => {
    const updated = updateProduct('p1', { slug: 'alpha-widget' });
    expect(updated.slug).toBe('alpha-widget');
  });

  it('creates inventory log when stock changes', () => {
    updateProduct('p1', { stock: 20 });
    const db = loadDb();
    const log = db.inventoryLogs.find(l => l.productId === 'p1' && l.reason === 'manual_adjustment');
    expect(log).toBeTruthy();
    expect(log!.previousStock).toBe(10);
    expect(log!.newStock).toBe(20);
  });

  it('does not create inventory log when stock unchanged', () => {
    const logsBefore = loadDb().inventoryLogs.length;
    updateProduct('p1', { name: 'Same Stock' });
    expect(loadDb().inventoryLogs.length).toBe(logsBefore);
  });
});

describe('deleteProduct', () => {
  it('archives the product instead of deleting', () => {
    deleteProduct('p1');
    const db = loadDb();
    const p = db.products.find(p => p.id === 'p1');
    expect(p).toBeTruthy();
    expect(p!.status).toBe('archived');
  });

  it('throws NotFoundError for unknown id', () => {
    expect(() => deleteProduct('nonexistent')).toThrow(NotFoundError);
  });
});

describe('getCategories', () => {
  it('returns all categories', () => {
    const cats = getCategories();
    expect(cats).toHaveLength(2);
  });
});
