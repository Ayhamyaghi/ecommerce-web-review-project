import { describe, it, expect } from 'vitest';
import {
  products,
  categories,
  getProductById,
  getProductsByCategory,
  getRelatedProducts,
} from '@/lib/products';

describe('products catalogue', () => {
  it('has at least 20 products', () => {
    expect(products.length).toBeGreaterThanOrEqual(20);
  });

  it('every product has required fields', () => {
    for (const p of products) {
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
      expect(typeof p.name).toBe('string');
      expect(typeof p.description).toBe('string');
      expect(typeof p.price).toBe('number');
      expect(p.price).toBeGreaterThan(0);
      expect(Number.isInteger(p.price)).toBe(true);
      expect(typeof p.category).toBe('string');
      expect(typeof p.stock).toBe('number');
      expect(p.stock).toBeGreaterThanOrEqual(0);
    }
  });

  it('product IDs are unique', () => {
    const ids = products.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('categories', () => {
  it('derives unique categories from products', () => {
    expect(new Set(categories).size).toBe(categories.length);
    expect(categories.length).toBeGreaterThanOrEqual(4);
  });

  it('includes known categories', () => {
    expect(categories).toContain('Electronics');
    expect(categories).toContain('Clothing');
    expect(categories).toContain('Books');
  });
});

describe('getProductById', () => {
  it('returns the correct product', () => {
    const p = getProductById('elec-001');
    expect(p).toBeDefined();
    expect(p?.name).toBe('Wireless Bluetooth Headphones');
  });

  it('returns undefined for unknown id', () => {
    expect(getProductById('does-not-exist')).toBeUndefined();
  });
});

describe('getProductsByCategory', () => {
  it('returns only products from the specified category', () => {
    const electronics = getProductsByCategory('Electronics');
    expect(electronics.length).toBeGreaterThan(0);
    expect(electronics.every((p) => p.category === 'Electronics')).toBe(true);
  });

  it('returns empty array for unknown category', () => {
    expect(getProductsByCategory('Nonexistent')).toHaveLength(0);
  });
});

describe('getRelatedProducts', () => {
  it('excludes the source product', () => {
    const source = products.find((p) => p.id === 'elec-001')!;
    const related = getRelatedProducts(source);
    expect(related.every((p) => p.id !== source.id)).toBe(true);
  });

  it('returns products from the same category', () => {
    const source = products.find((p) => p.id === 'elec-001')!;
    const related = getRelatedProducts(source);
    expect(related.every((p) => p.category === source.category)).toBe(true);
  });

  it('respects the limit parameter', () => {
    const source = products.find((p) => p.category === 'Electronics')!;
    expect(getRelatedProducts(source, 2)).toHaveLength(2);
  });

  it('returns at most the number of other products in the category', () => {
    const source = products.find((p) => p.category === 'Books')!;
    const booksCount = products.filter((p) => p.category === 'Books').length;
    const related = getRelatedProducts(source, 100);
    expect(related.length).toBeLessThanOrEqual(booksCount - 1);
  });
});
