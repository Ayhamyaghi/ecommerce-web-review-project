import { describe, it, expect } from 'vitest';
import {
  calculatePercentageDiscount,
  calculateFixedDiscount,
  calculateShipping,
  validatePromotion,
  applyPromotion,
  revalidatePromotion,
  calculatePricingBreakdown,
  findPromotion,
} from '@/lib/promotions';
import { Product, CartItem } from '@/lib/types';

const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Widget',
    description: 'A widget',
    price: 2500,
    category: 'Tools',
    image: '/img.jpg',
    stock: 10,
  },
  {
    id: 'p2',
    name: 'Gadget',
    description: 'A gadget',
    price: 5000,
    category: 'Electronics',
    image: '/img2.jpg',
    stock: 5,
  },
];

describe('calculatePercentageDiscount', () => {
  it('calculates 10% of subtotal', () => {
    // 10% of 10000 = 1000
    expect(calculatePercentageDiscount(10000, 10, null)).toBe(1000);
  });

  it('floors fractional cents', () => {
    // 10% of 1999 = 199.9 → 199
    expect(calculatePercentageDiscount(1999, 10, null)).toBe(199);
  });

  it('caps at maxDiscount', () => {
    // 10% of 100000 = 10000, but cap is 5000
    expect(calculatePercentageDiscount(100000, 10, 5000)).toBe(5000);
  });

  it('does not cap when discount is below max', () => {
    expect(calculatePercentageDiscount(10000, 10, 5000)).toBe(1000);
  });
});

describe('calculateFixedDiscount', () => {
  it('returns the fixed amount', () => {
    expect(calculateFixedDiscount(10000, 500)).toBe(500);
  });

  it('caps discount at subtotal to prevent negative', () => {
    expect(calculateFixedDiscount(300, 500)).toBe(300);
  });
});

describe('calculateShipping', () => {
  it('charges standard shipping below threshold', () => {
    expect(calculateShipping(4999, false)).toBe(599);
  });

  it('gives free shipping at threshold', () => {
    expect(calculateShipping(5000, false)).toBe(0);
  });

  it('gives free shipping above threshold', () => {
    expect(calculateShipping(10000, false)).toBe(0);
  });

  it('gives free shipping when freeShipping flag is true', () => {
    expect(calculateShipping(1000, true)).toBe(0);
  });
});

describe('findPromotion', () => {
  it('finds SAVE10 case-insensitively', () => {
    expect(findPromotion('save10')?.code).toBe('SAVE10');
    expect(findPromotion('Save10')?.code).toBe('SAVE10');
    expect(findPromotion('SAVE10')?.code).toBe('SAVE10');
  });

  it('trims whitespace', () => {
    expect(findPromotion('  SAVE10  ')?.code).toBe('SAVE10');
  });

  it('returns undefined for unknown code', () => {
    expect(findPromotion('NOTREAL')).toBeUndefined();
  });
});

describe('validatePromotion', () => {
  it('rejects empty code', () => {
    const result = validatePromotion('', 10000, null);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('enter');
  });

  it('rejects unknown code', () => {
    const result = validatePromotion('FAKECODE', 10000, null);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Invalid');
  });

  it('rejects when subtotal is below minimum', () => {
    // SAVE10 requires $20.00 (2000 cents)
    const result = validatePromotion('SAVE10', 1500, null);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Minimum subtotal');
  });

  it('rejects already applied code', () => {
    const result = validatePromotion('SAVE10', 5000, 'SAVE10');
    expect(result.valid).toBe(false);
    expect(result.message).toContain('already applied');
  });

  it('accepts valid SAVE10', () => {
    const result = validatePromotion('SAVE10', 5000, null);
    expect(result.valid).toBe(true);
    expect(result.promotion?.code).toBe('SAVE10');
  });

  it('accepts case-insensitive code', () => {
    const result = validatePromotion('save10', 5000, null);
    expect(result.valid).toBe(true);
  });
});

describe('applyPromotion', () => {
  it('applies SAVE10 as percentage discount', () => {
    const promo = findPromotion('SAVE10')!;
    const applied = applyPromotion(promo, 10000);
    expect(applied.code).toBe('SAVE10');
    expect(applied.discountAmount).toBe(1000); // 10% of $100
    expect(applied.freeShipping).toBe(false);
  });

  it('applies WELCOME5 as fixed discount', () => {
    const promo = findPromotion('WELCOME5')!;
    const applied = applyPromotion(promo, 5000);
    expect(applied.discountAmount).toBe(500);
    expect(applied.freeShipping).toBe(false);
  });

  it('applies FREESHIP as free-shipping', () => {
    const promo = findPromotion('FREESHIP')!;
    const applied = applyPromotion(promo, 3000);
    expect(applied.discountAmount).toBe(0);
    expect(applied.freeShipping).toBe(true);
  });
});

describe('revalidatePromotion', () => {
  const items: CartItem[] = [
    { productId: 'p1', quantity: 2 }, // 2 * 2500 = 5000
  ];

  it('returns applied promotion when still valid', () => {
    const result = revalidatePromotion('SAVE10', items, mockProducts);
    expect(result).not.toBeNull();
    expect(result!.code).toBe('SAVE10');
    expect(result!.discountAmount).toBe(500); // 10% of 5000
  });

  it('invalidates promotion when cart becomes empty', () => {
    const result = revalidatePromotion('SAVE10', [], mockProducts);
    expect(result).toBeNull();
  });

  it('returns null for empty cart', () => {
    expect(revalidatePromotion('SAVE10', [], mockProducts)).toBeNull();
  });

  it('returns null for unknown promotion code', () => {
    expect(revalidatePromotion('UNKNOWN', items, mockProducts)).toBeNull();
  });
});

describe('calculatePricingBreakdown', () => {
  const items: CartItem[] = [
    { productId: 'p1', quantity: 1 }, // 2500
    { productId: 'p2', quantity: 1 }, // 5000
  ];
  // Subtotal: 7500

  it('calculates breakdown with no promotion', () => {
    const result = calculatePricingBreakdown(items, mockProducts, null);
    expect(result.subtotal).toBe(7500);
    expect(result.discount).toBe(0);
    expect(result.shipping).toBe(0); // 7500 >= 5000 threshold
    expect(result.total).toBe(7500);
  });

  it('calculates breakdown with percentage discount', () => {
    const applied = applyPromotion(findPromotion('SAVE10')!, 7500);
    const result = calculatePricingBreakdown(items, mockProducts, applied);
    expect(result.subtotal).toBe(7500);
    expect(result.discount).toBe(750); // 10% of 7500
    expect(result.shipping).toBe(0);
    expect(result.total).toBe(6750);
  });

  it('calculates breakdown with fixed discount', () => {
    const applied = applyPromotion(findPromotion('WELCOME5')!, 7500);
    const result = calculatePricingBreakdown(items, mockProducts, applied);
    expect(result.subtotal).toBe(7500);
    expect(result.discount).toBe(500);
    expect(result.total).toBe(7000);
  });

  it('calculates breakdown with free shipping on small order', () => {
    const smallItems: CartItem[] = [{ productId: 'p1', quantity: 1 }]; // 2500
    const applied = applyPromotion(findPromotion('FREESHIP')!, 2500);
    const result = calculatePricingBreakdown(smallItems, mockProducts, applied);
    expect(result.subtotal).toBe(2500);
    expect(result.discount).toBe(0);
    expect(result.shipping).toBe(0); // FREESHIP removes shipping
    expect(result.total).toBe(2500);
  });

  it('charges shipping on small order without promotion', () => {
    const smallItems: CartItem[] = [{ productId: 'p1', quantity: 1 }]; // 2500
    const result = calculatePricingBreakdown(smallItems, mockProducts, null);
    expect(result.subtotal).toBe(2500);
    expect(result.shipping).toBe(599);
    expect(result.total).toBe(3099);
  });

  it('never produces a negative total', () => {
    // Simulate a discount larger than subtotal (edge case with fixed discount)
    const applied = { code: 'TEST', discountAmount: 99999, freeShipping: false };
    const result = calculatePricingBreakdown(items, mockProducts, applied);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('returns zeros for empty cart', () => {
    const result = calculatePricingBreakdown([], mockProducts, null);
    expect(result.subtotal).toBe(0);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(0);
  });
});
