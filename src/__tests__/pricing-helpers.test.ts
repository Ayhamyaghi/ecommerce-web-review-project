import { describe, it, expect } from 'vitest';
import {
  calculateDiscountAmount,
  promotionGrantsFreeShipping,
  calculateShippingCost,
  computePromotionPricing,
  SHIPPING_COST_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
} from '@/lib/services/pricing-helpers';
import type { DbPromotion } from '@/lib/db/store';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makePromotion(overrides: Partial<DbPromotion> = {}): DbPromotion {
  return {
    id: 'promo-1',
    code: 'TEST10',
    type: 'percentage',
    value: 10,
    minOrderAmount: 1000,
    maxDiscount: null,
    usageLimit: null,
    usageCount: 0,
    description: 'Test 10% off',
    active: true,
    startsAt: '2020-01-01T00:00:00Z',
    expiresAt: '2099-12-31T00:00:00Z',
    createdAt: '2020-01-01T00:00:00Z',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// calculateDiscountAmount
// ---------------------------------------------------------------------------

describe('calculateDiscountAmount — percentage promotions', () => {
  it('calculates 10% of a subtotal', () => {
    const promo = makePromotion({ type: 'percentage', value: 10, maxDiscount: null });
    expect(calculateDiscountAmount(promo, 10000)).toBe(1000);
  });

  it('rounds the discount using Math.round', () => {
    // 15% of 999 = 149.85 → rounds to 150
    const promo = makePromotion({ type: 'percentage', value: 15, maxDiscount: null });
    expect(calculateDiscountAmount(promo, 999)).toBe(150);
  });

  it('caps the discount at maxDiscount', () => {
    const promo = makePromotion({ type: 'percentage', value: 20, maxDiscount: 500 });
    // 20% of 5000 = 1000, capped at 500
    expect(calculateDiscountAmount(promo, 5000)).toBe(500);
  });

  it('does not cap when discount is below maxDiscount', () => {
    const promo = makePromotion({ type: 'percentage', value: 5, maxDiscount: 1000 });
    // 5% of 5000 = 250 < 1000
    expect(calculateDiscountAmount(promo, 5000)).toBe(250);
  });

  it('returns 0 for a 0% promotion', () => {
    const promo = makePromotion({ type: 'percentage', value: 0, maxDiscount: null });
    expect(calculateDiscountAmount(promo, 10000)).toBe(0);
  });
});

describe('calculateDiscountAmount — fixed promotions', () => {
  it('returns the fixed amount', () => {
    const promo = makePromotion({ type: 'fixed', value: 500 });
    expect(calculateDiscountAmount(promo, 10000)).toBe(500);
  });

  it('returns fixed amount even when subtotal is lower (order-service guards min)', () => {
    const promo = makePromotion({ type: 'fixed', value: 2000 });
    // The service validates min order; here we test the raw helper
    expect(calculateDiscountAmount(promo, 500)).toBe(2000);
  });
});

describe('calculateDiscountAmount — free_shipping promotions', () => {
  it('returns 0 for a free-shipping promotion', () => {
    const promo = makePromotion({ type: 'free_shipping', value: 0 });
    expect(calculateDiscountAmount(promo, 10000)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// promotionGrantsFreeShipping
// ---------------------------------------------------------------------------

describe('promotionGrantsFreeShipping', () => {
  it('returns true for free_shipping type', () => {
    expect(promotionGrantsFreeShipping(makePromotion({ type: 'free_shipping' }))).toBe(true);
  });

  it('returns false for percentage type', () => {
    expect(promotionGrantsFreeShipping(makePromotion({ type: 'percentage' }))).toBe(false);
  });

  it('returns false for fixed type', () => {
    expect(promotionGrantsFreeShipping(makePromotion({ type: 'fixed' }))).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// calculateShippingCost
// ---------------------------------------------------------------------------

describe('calculateShippingCost', () => {
  it('charges standard shipping below the free-shipping threshold', () => {
    expect(calculateShippingCost(FREE_SHIPPING_THRESHOLD_CENTS - 1, false)).toBe(SHIPPING_COST_CENTS);
  });

  it('gives free shipping exactly at the threshold', () => {
    expect(calculateShippingCost(FREE_SHIPPING_THRESHOLD_CENTS, false)).toBe(0);
  });

  it('gives free shipping above the threshold', () => {
    expect(calculateShippingCost(FREE_SHIPPING_THRESHOLD_CENTS + 1000, false)).toBe(0);
  });

  it('gives free shipping when freeShipping flag is true, regardless of subtotal', () => {
    expect(calculateShippingCost(100, true)).toBe(0);
  });

  it('charges shipping when subtotal is 0 and freeShipping is false', () => {
    // afterDiscount = 0 means order-service should have already thrown; this
    // verifies the helper itself does not special-case zero.
    expect(calculateShippingCost(0, false)).toBe(SHIPPING_COST_CENTS);
  });
});

// ---------------------------------------------------------------------------
// computePromotionPricing
// ---------------------------------------------------------------------------

describe('computePromotionPricing', () => {
  it('returns correct values for a percentage promotion', () => {
    const promo = makePromotion({ code: 'SAVE10', type: 'percentage', value: 10 });
    const result = computePromotionPricing(promo, 5000);
    expect(result.promotionCode).toBe('SAVE10');
    expect(result.discount).toBe(500);
    expect(result.freeShipping).toBe(false);
  });

  it('returns correct values for a fixed promotion', () => {
    const promo = makePromotion({ code: 'FLAT5', type: 'fixed', value: 500 });
    const result = computePromotionPricing(promo, 5000);
    expect(result.promotionCode).toBe('FLAT5');
    expect(result.discount).toBe(500);
    expect(result.freeShipping).toBe(false);
  });

  it('returns correct values for a free_shipping promotion', () => {
    const promo = makePromotion({ code: 'SHIP', type: 'free_shipping', value: 0 });
    const result = computePromotionPricing(promo, 3000);
    expect(result.promotionCode).toBe('SHIP');
    expect(result.discount).toBe(0);
    expect(result.freeShipping).toBe(true);
  });
});
