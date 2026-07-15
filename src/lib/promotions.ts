import {
  Promotion,
  AppliedPromotion,
  PricingBreakdown,
  PromotionValidationResult,
  CartItem,
  Product,
} from './types';
import { getCartTotal } from './cart-utils';

// Standard shipping cost: $5.99
const STANDARD_SHIPPING_CENTS = 599;
// Free shipping threshold: $50.00
const FREE_SHIPPING_THRESHOLD_CENTS = 5000;

export const promotions: Promotion[] = [
  {
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    minSubtotal: 2000, // $20.00
    maxDiscount: 5000, // $50.00 cap
    description: '10% off your order (max $50 discount, min $20 subtotal)',
  },
  {
    code: 'WELCOME5',
    type: 'fixed',
    value: 500, // $5.00
    minSubtotal: 1500, // $15.00
    maxDiscount: null,
    description: '$5 off your order (min $15 subtotal)',
  },
  {
    code: 'FREESHIP',
    type: 'free-shipping',
    value: 0,
    minSubtotal: 1000, // $10.00
    maxDiscount: null,
    description: 'Free shipping on your order (min $10 subtotal)',
  },
];

export function findPromotion(code: string): Promotion | undefined {
  const normalized = code.trim().toUpperCase();
  return promotions.find((p) => p.code === normalized);
}

export function calculatePercentageDiscount(
  subtotal: number,
  rate: number,
  maxDiscount: number | null,
): number {
  const discount = Math.floor((subtotal * rate) / 100);
  if (maxDiscount !== null) {
    return Math.min(discount, maxDiscount);
  }
  return discount;
}

export function calculateFixedDiscount(
  subtotal: number,
  amount: number,
): number {
  // Discount cannot exceed subtotal
  return Math.min(amount, subtotal);
}

export function calculateShipping(
  subtotal: number,
  freeShipping: boolean,
): number {
  if (subtotal === 0) return 0;
  if (freeShipping || subtotal >= FREE_SHIPPING_THRESHOLD_CENTS) {
    return 0;
  }
  return STANDARD_SHIPPING_CENTS;
}

export function validatePromotion(
  code: string,
  subtotal: number,
  currentPromoCode: string | null,
): PromotionValidationResult {
  const trimmed = code.trim();
  if (!trimmed) {
    return { valid: false, message: 'Please enter a promotion code.' };
  }

  const promo = findPromotion(trimmed);
  if (!promo) {
    return { valid: false, message: 'Invalid promotion code.' };
  }

  if (currentPromoCode && currentPromoCode === promo.code) {
    return { valid: false, message: 'This promotion is already applied.' };
  }

  if (subtotal < promo.minSubtotal) {
    return {
      valid: false,
      message: `Minimum subtotal of $${(promo.minSubtotal / 100).toFixed(2)} required.`,
    };
  }

  return { valid: true, message: promo.description, promotion: promo };
}

export function applyPromotion(
  promotion: Promotion,
  subtotal: number,
): AppliedPromotion {
  let discountAmount = 0;
  let freeShipping = false;

  switch (promotion.type) {
    case 'percentage':
      discountAmount = calculatePercentageDiscount(
        subtotal,
        promotion.value,
        promotion.maxDiscount,
      );
      break;
    case 'fixed':
      discountAmount = calculateFixedDiscount(subtotal, promotion.value);
      break;
    case 'free-shipping':
      freeShipping = true;
      break;
  }

  return {
    code: promotion.code,
    discountAmount,
    freeShipping,
  };
}

/** Revalidate an applied promotion against the current cart state */
export function revalidatePromotion(
  appliedCode: string,
  items: CartItem[],
  products: Product[],
): AppliedPromotion | null {
  const subtotal = getCartTotal(items, products);
  if (items.length === 0 || subtotal === 0) return null;

  const promo = findPromotion(appliedCode);
  if (!promo) return null;
  if (subtotal < promo.minSubtotal) return null;

  return applyPromotion(promo, subtotal);
}

export function calculatePricingBreakdown(
  items: CartItem[],
  products: Product[],
  applied: AppliedPromotion | null,
): PricingBreakdown {
  const subtotal = getCartTotal(items, products);
  const discount = applied ? applied.discountAmount : 0;
  const afterDiscount = Math.max(subtotal - discount, 0);
  const freeShipping = applied?.freeShipping ?? false;
  const shipping = calculateShipping(subtotal, freeShipping);
  const total = Math.max(afterDiscount + shipping, 0);

  return { subtotal, discount, shipping, total };
}
