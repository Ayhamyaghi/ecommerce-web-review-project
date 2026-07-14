import { describe, it, expect } from 'vitest';
import {
  addItem,
  updateQuantity,
  removeItem,
  getItemSubtotal,
  getCartTotal,
  reconcileCart,
  validateCartData,
} from '@/lib/cart-utils';
import { CartItem, Product } from '@/lib/types';

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Widget',
    description: 'A widget',
    price: 1999,
    category: 'Tools',
    image: '/img.jpg',
    stock: 10,
  },
  {
    id: 'p2',
    name: 'Gadget',
    description: 'A gadget',
    price: 4999,
    category: 'Electronics',
    image: '/img2.jpg',
    stock: 5,
  },
  {
    id: 'p3',
    name: 'Out of Stock Item',
    description: 'Unavailable',
    price: 999,
    category: 'Tools',
    image: '/img3.jpg',
    stock: 0,
  },
];

describe('addItem', () => {
  it('adds a new item to an empty cart', () => {
    const result = addItem([], 'p1', 1, 10);
    expect(result).toEqual([{ productId: 'p1', quantity: 1 }]);
  });

  it('increments quantity when adding a duplicate item (EC4)', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 2 }];
    const result = addItem(items, 'p1', 3, 10);
    expect(result).toEqual([{ productId: 'p1', quantity: 5 }]);
  });

  it('caps quantity at stock level when adding (EC2)', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 8 }];
    const result = addItem(items, 'p1', 5, 10);
    expect(result).toEqual([{ productId: 'p1', quantity: 10 }]);
  });

  it('caps new item quantity at stock level', () => {
    const result = addItem([], 'p1', 15, 10);
    expect(result).toEqual([{ productId: 'p1', quantity: 10 }]);
  });

  it('returns unchanged cart when stock is zero (EC1)', () => {
    const result = addItem([], 'p3', 1, 0);
    expect(result).toEqual([]);
  });

  it('returns unchanged cart when quantity is zero', () => {
    const result = addItem([], 'p1', 0, 10);
    expect(result).toEqual([]);
  });
});

describe('updateQuantity', () => {
  const items: CartItem[] = [
    { productId: 'p1', quantity: 3 },
    { productId: 'p2', quantity: 2 },
  ];

  it('updates quantity to a valid value', () => {
    const result = updateQuantity(items, 'p1', 5, 10);
    expect(result.find((i) => i.productId === 'p1')?.quantity).toBe(5);
  });

  it('removes item when quantity becomes zero (EC3)', () => {
    const result = updateQuantity(items, 'p1', 0, 10);
    expect(result.find((i) => i.productId === 'p1')).toBeUndefined();
    expect(result).toHaveLength(1);
  });

  it('removes item when quantity is negative', () => {
    const result = updateQuantity(items, 'p1', -1, 10);
    expect(result.find((i) => i.productId === 'p1')).toBeUndefined();
  });

  it('caps quantity at stock level (EC2)', () => {
    const result = updateQuantity(items, 'p2', 20, 5);
    expect(result.find((i) => i.productId === 'p2')?.quantity).toBe(5);
  });
});

describe('removeItem', () => {
  it('removes an existing item', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1 }];
    expect(removeItem(items, 'p1')).toEqual([]);
  });

  it('returns unchanged cart when removing non-existent item', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 1 }];
    const result = removeItem(items, 'p999');
    expect(result).toEqual(items);
  });
});

describe('getItemSubtotal', () => {
  it('calculates subtotal using integer arithmetic (EC12)', () => {
    expect(getItemSubtotal(3, 1999)).toBe(5997);
  });

  it('returns zero for zero quantity', () => {
    expect(getItemSubtotal(0, 1999)).toBe(0);
  });
});

describe('getCartTotal', () => {
  it('calculates total for multiple items (EC12)', () => {
    const items: CartItem[] = [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1 },
    ];
    // 2 * 1999 + 1 * 4999 = 3998 + 4999 = 8997
    expect(getCartTotal(items, mockProducts)).toBe(8997);
  });

  it('returns zero for empty cart', () => {
    expect(getCartTotal([], mockProducts)).toBe(0);
  });

  it('skips items with unknown product IDs', () => {
    const items: CartItem[] = [{ productId: 'unknown', quantity: 1 }];
    expect(getCartTotal(items, mockProducts)).toBe(0);
  });
});

describe('reconcileCart', () => {
  it('removes items whose product no longer exists (EC9)', () => {
    const items: CartItem[] = [
      { productId: 'p1', quantity: 2 },
      { productId: 'deleted-product', quantity: 1 },
    ];
    const result = reconcileCart(items, mockProducts);
    expect(result).toEqual([{ productId: 'p1', quantity: 2 }]);
  });

  it('caps quantity at reduced stock level (EC10)', () => {
    const items: CartItem[] = [{ productId: 'p2', quantity: 10 }];
    const result = reconcileCart(items, mockProducts);
    expect(result).toEqual([{ productId: 'p2', quantity: 5 }]);
  });

  it('removes items whose stock became zero', () => {
    const items: CartItem[] = [{ productId: 'p3', quantity: 2 }];
    const result = reconcileCart(items, mockProducts);
    expect(result).toEqual([]);
  });

  it('preserves valid items unchanged', () => {
    const items: CartItem[] = [{ productId: 'p1', quantity: 3 }];
    const result = reconcileCart(items, mockProducts);
    expect(result).toEqual([{ productId: 'p1', quantity: 3 }]);
  });
});

describe('validateCartData', () => {
  it('accepts a valid CartItem array', () => {
    const data = [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1 },
    ];
    expect(validateCartData(data)).toEqual(data);
  });

  it('returns null for non-array data (EC8)', () => {
    expect(validateCartData('not an array')).toBeNull();
    expect(validateCartData(42)).toBeNull();
    expect(validateCartData(null)).toBeNull();
    expect(validateCartData({})).toBeNull();
  });

  it('returns null when an item has missing productId (EC8)', () => {
    const data = [{ quantity: 2 }];
    expect(validateCartData(data)).toBeNull();
  });

  it('returns null when an item has wrong type for quantity (EC8)', () => {
    const data = [{ productId: 'p1', quantity: 'three' }];
    expect(validateCartData(data)).toBeNull();
  });

  it('returns null when quantity is NaN', () => {
    const data = [{ productId: 'p1', quantity: NaN }];
    expect(validateCartData(data)).toBeNull();
  });

  it('returns null when quantity is negative', () => {
    const data = [{ productId: 'p1', quantity: -1 }];
    expect(validateCartData(data)).toBeNull();
  });

  it('accepts an empty array', () => {
    expect(validateCartData([])).toEqual([]);
  });
});
