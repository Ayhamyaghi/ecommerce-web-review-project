import { describe, it, expect } from 'vitest';
import {
  searchProducts,
  filterByCategory,
  filterByPriceRange,
  sortProducts,
  applyFilters,
} from '@/lib/filter-utils';
import { Product } from '@/lib/types';

const testProducts: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    description: 'Bluetooth over-ear headphones',
    price: 7999,
    category: 'Electronics',
    image: '/a.jpg',
    stock: 10,
  },
  {
    id: '2',
    name: 'Cotton T-Shirt',
    description: 'Soft cotton crew neck',
    price: 1999,
    category: 'Clothing',
    image: '/b.jpg',
    stock: 50,
  },
  {
    id: '3',
    name: 'Steel Water Bottle',
    description: 'Insulated stainless steel bottle',
    price: 2499,
    category: 'Home & Kitchen',
    image: '/c.jpg',
    stock: 30,
  },
  {
    id: '4',
    name: 'Programming Book',
    description: 'Learn TypeScript programming',
    price: 3999,
    category: 'Books',
    image: '/d.jpg',
    stock: 20,
  },
];

describe('searchProducts', () => {
  it('finds products by name (case-insensitive)', () => {
    const result = searchProducts(testProducts, 'headphones');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('finds products by description', () => {
    const result = searchProducts(testProducts, 'typescript');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('4');
  });

  it('returns all products for empty search', () => {
    expect(searchProducts(testProducts, '')).toHaveLength(4);
    expect(searchProducts(testProducts, '   ')).toHaveLength(4);
  });

  it('returns empty array when no matches (EC6)', () => {
    expect(searchProducts(testProducts, 'xyznonexistent')).toEqual([]);
  });
});

describe('filterByCategory', () => {
  it('filters by exact category', () => {
    const result = filterByCategory(testProducts, 'Electronics');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns all products when category is null', () => {
    expect(filterByCategory(testProducts, null)).toHaveLength(4);
  });

  it('returns empty when category has no matches', () => {
    expect(filterByCategory(testProducts, 'Toys')).toEqual([]);
  });
});

describe('filterByPriceRange', () => {
  it('filters within price range (cents)', () => {
    const result = filterByPriceRange(testProducts, 2000, 4000);
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id).sort()).toEqual(['3', '4']);
  });

  it('includes boundary values', () => {
    const result = filterByPriceRange(testProducts, 1999, 1999);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

describe('sortProducts', () => {
  it('sorts by price ascending', () => {
    const result = sortProducts(testProducts, 'price-asc');
    expect(result.map((p) => p.price)).toEqual([1999, 2499, 3999, 7999]);
  });

  it('sorts by price descending', () => {
    const result = sortProducts(testProducts, 'price-desc');
    expect(result.map((p) => p.price)).toEqual([7999, 3999, 2499, 1999]);
  });

  it('sorts by name ascending', () => {
    const result = sortProducts(testProducts, 'name-asc');
    expect(result[0].name).toBe('Cotton T-Shirt');
  });

  it('sorts by name descending', () => {
    const result = sortProducts(testProducts, 'name-desc');
    expect(result[0].name).toBe('Wireless Headphones');
  });

  it('preserves order for relevance', () => {
    const result = sortProducts(testProducts, 'relevance');
    expect(result.map((p) => p.id)).toEqual(['1', '2', '3', '4']);
  });
});

describe('applyFilters', () => {
  it('composes search, category, and sort', () => {
    const result = applyFilters(testProducts, {
      search: '',
      category: 'Electronics',
      priceRange: null,
      sort: 'price-asc',
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('returns empty when combined filters match nothing (EC7)', () => {
    const result = applyFilters(testProducts, {
      search: 'headphones',
      category: 'Books',
      priceRange: null,
      sort: 'relevance',
    });
    expect(result).toEqual([]);
  });

  it('applies price range filter', () => {
    const result = applyFilters(testProducts, {
      search: '',
      category: null,
      priceRange: { min: 0, max: 2500 },
      sort: 'price-asc',
    });
    expect(result).toHaveLength(2);
    expect(result.map((p) => p.id)).toEqual(['2', '3']);
  });
});
