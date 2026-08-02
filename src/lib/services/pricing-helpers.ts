/**
 * Shared pricing calculation helpers used by both promotion-service and
 * order-service.
 *
 * Previously, the discount-amount arithmetic was duplicated in
 * `validatePromotionCode` (promotion-service) and `checkout` (order-service).
 * This module is the single source of truth for those calculations.
 */
import type { DbPromotion } from '../db/store';

export const SHIPPING_COST_CENTS = 599;
export const FREE_SHIPPING_THRESHOLD_CENTS = 5000;

// ---------------------------------------------------------------------------
// Discount calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the monetary discount (in cents) that a promotion applies to the
 * given subtotal. Returns 0 for free-shipping promotions (they do not reduce
 * the subtotal).
 */
export function calculateDiscountAmount(promotion: DbPromotion, subtotal: number): number {
  if (promotion.type === 'percentage') {
    const raw = Math.round(subtotal * (promotion.value / 100));
    return promotion.maxDiscount !== null ? Math.min(raw, promotion.maxDiscount) : raw;
  }
  if (promotion.type === 'fixed') {
    return promotion.value;
  }
  // free_shipping — no monetary discount
  return 0;
}

/**
 * Whether the promotion grants free shipping.
 */
export function promotionGrantsFreeShipping(promotion: DbPromotion): boolean {
  return promotion.type === 'free_shipping';
}

// ---------------------------------------------------------------------------
// Shipping calculation
// ---------------------------------------------------------------------------

/**
 * Calculate the shipping charge (in cents) given the post-discount subtotal
 * and whether a free-shipping promotion has been applied.
 */
export function calculateShippingCost(afterDiscountSubtotal: number, freeShipping: boolean): number {
  if (freeShipping || afterDiscountSubtotal >= FREE_SHIPPING_THRESHOLD_CENTS) {
    return 0;
  }
  return SHIPPING_COST_CENTS;
}

// ---------------------------------------------------------------------------
// Composite helper used by checkout
// ---------------------------------------------------------------------------

export interface AppliedPromotionPricing {
  discount: number;
  freeShipping: boolean;
  promotionCode: string;
}

/**
 * Given a validated `DbPromotion` and a cart subtotal, compute all
 * pricing-related values that the checkout flow needs. This removes the
 * branching logic from `checkout()` in order-service.
 */
export function computePromotionPricing(
  promotion: DbPromotion,
  subtotal: number,
): AppliedPromotionPricing {
  return {
    discount: calculateDiscountAmount(promotion, subtotal),
    freeShipping: promotionGrantsFreeShipping(promotion),
    promotionCode: promotion.code,
  };
}
