import { describe, it, expect } from 'vitest';
import { ZodError } from 'zod';

import { registerSchema, loginSchema } from '@/lib/schemas/auth';
import { addToCartSchema, updateCartItemSchema, removeCartItemSchema } from '@/lib/schemas/cart';
import { wishlistProductSchema } from '@/lib/schemas/wishlist';
import { adjustStockSchema } from '@/lib/schemas/inventory';
import { createReviewSchema, updateReviewSchema } from '@/lib/schemas/review';
import { checkoutSchema, orderStatusUpdateSchema } from '@/lib/schemas/order';
import { createPromotionSchema, validatePromotionSchema } from '@/lib/schemas/promotion';
import { createProductSchema } from '@/lib/schemas/product';

// ---------------------------------------------------------------------------
// Auth schemas
// ---------------------------------------------------------------------------

describe('registerSchema', () => {
  const valid = { name: 'Alice Smith', email: 'alice@example.com', password: 'secret123' };

  it('accepts valid registration input', () => {
    expect(() => registerSchema.parse(valid)).not.toThrow();
  });

  it('trims and lowercases email', () => {
    const result = registerSchema.parse({ ...valid, email: '  Alice@EXAMPLE.COM  ' });
    expect(result.email).toBe('alice@example.com');
  });

  it('trims name', () => {
    const result = registerSchema.parse({ ...valid, name: '  Alice  ' });
    expect(result.name).toBe('Alice');
  });

  it('rejects name shorter than 2 characters', () => {
    expect(() => registerSchema.parse({ ...valid, name: 'A' })).toThrow(ZodError);
  });

  it('rejects name longer than 100 characters', () => {
    expect(() => registerSchema.parse({ ...valid, name: 'A'.repeat(101) })).toThrow(ZodError);
  });

  it('rejects missing name', () => {
    const rest = { email: valid.email, password: valid.password };
    expect(() => registerSchema.parse(rest)).toThrow(ZodError);
  });

  it('rejects invalid email format', () => {
    expect(() => registerSchema.parse({ ...valid, email: 'not-an-email' })).toThrow(ZodError);
  });

  it('rejects email longer than 254 characters', () => {
    const longEmail = 'a'.repeat(250) + '@x.co';
    expect(() => registerSchema.parse({ ...valid, email: longEmail })).toThrow(ZodError);
  });

  it('rejects password shorter than 6 characters', () => {
    expect(() => registerSchema.parse({ ...valid, password: 'abc' })).toThrow(ZodError);
  });

  it('rejects password longer than 100 characters', () => {
    expect(() => registerSchema.parse({ ...valid, password: 'p'.repeat(101) })).toThrow(ZodError);
  });

  it('rejects missing password', () => {
    expect(() => registerSchema.parse({ name: valid.name, email: valid.email })).toThrow(ZodError);
  });

  it('rejects non-string name', () => {
    expect(() => registerSchema.parse({ ...valid, name: 123 })).toThrow(ZodError);
  });
});

describe('loginSchema', () => {
  const valid = { email: 'user@example.com', password: 'mypassword' };

  it('accepts valid login input', () => {
    expect(() => loginSchema.parse(valid)).not.toThrow();
  });

  it('trims and lowercases email', () => {
    const result = loginSchema.parse({ ...valid, email: ' USER@EXAMPLE.COM ' });
    expect(result.email).toBe('user@example.com');
  });

  it('rejects invalid email', () => {
    expect(() => loginSchema.parse({ ...valid, email: 'bad' })).toThrow(ZodError);
  });

  it('rejects empty password', () => {
    expect(() => loginSchema.parse({ ...valid, password: '' })).toThrow(ZodError);
  });

  it('rejects missing email', () => {
    expect(() => loginSchema.parse({ password: valid.password })).toThrow(ZodError);
  });

  it('rejects missing password', () => {
    expect(() => loginSchema.parse({ email: valid.email })).toThrow(ZodError);
  });
});

// ---------------------------------------------------------------------------
// Cart schemas
// ---------------------------------------------------------------------------

describe('addToCartSchema', () => {
  const valid = { productId: 'prod-1', quantity: 2 };

  it('accepts valid input', () => {
    expect(() => addToCartSchema.parse(valid)).not.toThrow();
  });

  it('rejects missing productId', () => {
    expect(() => addToCartSchema.parse({ quantity: 1 })).toThrow(ZodError);
  });

  it('rejects empty productId', () => {
    expect(() => addToCartSchema.parse({ ...valid, productId: '' })).toThrow(ZodError);
  });

  it('rejects quantity of 0', () => {
    expect(() => addToCartSchema.parse({ ...valid, quantity: 0 })).toThrow(ZodError);
  });

  it('rejects quantity greater than 99', () => {
    expect(() => addToCartSchema.parse({ ...valid, quantity: 100 })).toThrow(ZodError);
  });

  it('rejects non-integer quantity', () => {
    expect(() => addToCartSchema.parse({ ...valid, quantity: 1.5 })).toThrow(ZodError);
  });

  it('rejects string quantity', () => {
    expect(() => addToCartSchema.parse({ ...valid, quantity: '2' })).toThrow(ZodError);
  });

  it('rejects missing quantity', () => {
    expect(() => addToCartSchema.parse({ productId: 'x' })).toThrow(ZodError);
  });
});

describe('updateCartItemSchema', () => {
  const valid = { productId: 'prod-1', quantity: 3 };

  it('accepts quantity of 0 (remove intent)', () => {
    expect(() => updateCartItemSchema.parse({ ...valid, quantity: 0 })).not.toThrow();
  });

  it('rejects negative quantity', () => {
    expect(() => updateCartItemSchema.parse({ ...valid, quantity: -1 })).toThrow(ZodError);
  });

  it('rejects quantity greater than 99', () => {
    expect(() => updateCartItemSchema.parse({ ...valid, quantity: 100 })).toThrow(ZodError);
  });
});

describe('removeCartItemSchema', () => {
  it('accepts valid productId', () => {
    expect(() => removeCartItemSchema.parse({ productId: 'prod-123' })).not.toThrow();
  });

  it('rejects missing productId', () => {
    expect(() => removeCartItemSchema.parse({})).toThrow(ZodError);
  });

  it('rejects empty productId', () => {
    expect(() => removeCartItemSchema.parse({ productId: '' })).toThrow(ZodError);
  });
});

// ---------------------------------------------------------------------------
// Wishlist schema
// ---------------------------------------------------------------------------

describe('wishlistProductSchema', () => {
  it('accepts valid productId', () => {
    expect(() => wishlistProductSchema.parse({ productId: 'prod-abc' })).not.toThrow();
  });

  it('rejects missing productId', () => {
    expect(() => wishlistProductSchema.parse({})).toThrow(ZodError);
  });

  it('rejects empty productId', () => {
    expect(() => wishlistProductSchema.parse({ productId: '' })).toThrow(ZodError);
  });

  it('rejects non-string productId', () => {
    expect(() => wishlistProductSchema.parse({ productId: 42 })).toThrow(ZodError);
  });
});

// ---------------------------------------------------------------------------
// Inventory schema
// ---------------------------------------------------------------------------

describe('adjustStockSchema', () => {
  it('accepts valid stock adjustment', () => {
    const result = adjustStockSchema.parse({ stock: 50 });
    expect(result.stock).toBe(50);
    expect(result.reason).toBe('manual_adjustment');
  });

  it('accepts zero stock', () => {
    expect(() => adjustStockSchema.parse({ stock: 0 })).not.toThrow();
  });

  it('accepts restock reason', () => {
    const result = adjustStockSchema.parse({ stock: 10, reason: 'restock' });
    expect(result.reason).toBe('restock');
  });

  it('rejects negative stock', () => {
    expect(() => adjustStockSchema.parse({ stock: -1 })).toThrow(ZodError);
  });

  it('rejects missing stock', () => {
    expect(() => adjustStockSchema.parse({})).toThrow(ZodError);
  });

  it('rejects non-integer stock', () => {
    expect(() => adjustStockSchema.parse({ stock: 10.5 })).toThrow(ZodError);
  });

  it('rejects invalid reason', () => {
    expect(() => adjustStockSchema.parse({ stock: 10, reason: 'unknown_reason' })).toThrow(ZodError);
  });
});

// ---------------------------------------------------------------------------
// Review schemas
// ---------------------------------------------------------------------------

describe('createReviewSchema', () => {
  const valid = {
    productId: 'prod-1',
    rating: 4,
    title: 'Great product',
    body: 'Really enjoyed using this product for a few weeks.',
  };

  it('accepts valid review', () => {
    expect(() => createReviewSchema.parse(valid)).not.toThrow();
  });

  it('trims title and body whitespace', () => {
    const result = createReviewSchema.parse({ ...valid, title: '  Great product  ', body: '  ' + valid.body + '  ' });
    expect(result.title).toBe('Great product');
    expect(result.body).toBe(valid.body);
  });

  it('rejects missing productId', () => {
    expect(() => createReviewSchema.parse({ rating: valid.rating, title: valid.title, body: valid.body })).toThrow(ZodError);
  });

  it('rejects rating below 1', () => {
    expect(() => createReviewSchema.parse({ ...valid, rating: 0 })).toThrow(ZodError);
  });

  it('rejects rating above 5', () => {
    expect(() => createReviewSchema.parse({ ...valid, rating: 6 })).toThrow(ZodError);
  });

  it('rejects non-integer rating', () => {
    expect(() => createReviewSchema.parse({ ...valid, rating: 4.5 })).toThrow(ZodError);
  });

  it('rejects title shorter than 3 characters', () => {
    expect(() => createReviewSchema.parse({ ...valid, title: 'Hi' })).toThrow(ZodError);
  });

  it('rejects title longer than 100 characters', () => {
    expect(() => createReviewSchema.parse({ ...valid, title: 'T'.repeat(101) })).toThrow(ZodError);
  });

  it('rejects body shorter than 10 characters', () => {
    expect(() => createReviewSchema.parse({ ...valid, body: 'Too short' })).toThrow(ZodError);
  });

  it('rejects body longer than 2000 characters', () => {
    expect(() => createReviewSchema.parse({ ...valid, body: 'B'.repeat(2001) })).toThrow(ZodError);
  });
});

describe('updateReviewSchema', () => {
  it('accepts partial update with rating only', () => {
    expect(() => updateReviewSchema.parse({ rating: 3 })).not.toThrow();
  });

  it('accepts status-only update', () => {
    expect(() => updateReviewSchema.parse({ status: 'approved' })).not.toThrow();
  });

  it('rejects empty update object', () => {
    expect(() => updateReviewSchema.parse({})).toThrow(ZodError);
  });

  it('rejects invalid status', () => {
    expect(() => updateReviewSchema.parse({ status: 'spam' })).toThrow(ZodError);
  });

  it('rejects rating out of range in update', () => {
    expect(() => updateReviewSchema.parse({ rating: 10 })).toThrow(ZodError);
  });
});

// ---------------------------------------------------------------------------
// Order schemas
// ---------------------------------------------------------------------------

const validShippingAddress = {
  firstName: 'John',
  lastName: 'Doe',
  address: '123 Main St',
  city: 'Anytown',
  state: 'CA',
  postalCode: '90210',
  country: 'US',
};

describe('checkoutSchema', () => {
  const valid = {
    shippingAddress: validShippingAddress,
    email: 'john@example.com',
    phone: '5551234567',
    paymentMethod: 'credit_card' as const,
  };

  it('accepts valid checkout input', () => {
    expect(() => checkoutSchema.parse(valid)).not.toThrow();
  });

  it('trims and lowercases email', () => {
    const result = checkoutSchema.parse({ ...valid, email: '  JOHN@EXAMPLE.COM  ' });
    expect(result.email).toBe('john@example.com');
  });

  it('rejects invalid email', () => {
    expect(() => checkoutSchema.parse({ ...valid, email: 'not-email' })).toThrow(ZodError);
  });

  it('rejects missing shippingAddress', () => {
    expect(() =>
      checkoutSchema.parse({ email: valid.email, phone: valid.phone, paymentMethod: valid.paymentMethod }),
    ).toThrow(ZodError);
  });

  it('rejects empty firstName in address', () => {
    expect(() =>
      checkoutSchema.parse({
        ...valid,
        shippingAddress: { ...validShippingAddress, firstName: '' },
      }),
    ).toThrow(ZodError);
  });

  it('rejects address shorter than 5 characters', () => {
    expect(() =>
      checkoutSchema.parse({
        ...valid,
        shippingAddress: { ...validShippingAddress, address: '123' },
      }),
    ).toThrow(ZodError);
  });

  it('rejects invalid paymentMethod', () => {
    expect(() => checkoutSchema.parse({ ...valid, paymentMethod: 'bitcoin' })).toThrow(ZodError);
  });

  it('rejects phone shorter than 7 characters', () => {
    expect(() => checkoutSchema.parse({ ...valid, phone: '12345' })).toThrow(ZodError);
  });

  it('accepts optional promotionCode', () => {
    const result = checkoutSchema.parse({ ...valid, promotionCode: ' SAVE10 ' });
    expect(result.promotionCode).toBe('SAVE10');
  });

  it('accepts all valid paymentMethod values', () => {
    for (const pm of ['credit_card', 'debit_card', 'paypal'] as const) {
      expect(() => checkoutSchema.parse({ ...valid, paymentMethod: pm })).not.toThrow();
    }
  });
});

describe('orderStatusUpdateSchema', () => {
  it('accepts valid statuses', () => {
    for (const status of ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] as const) {
      expect(() => orderStatusUpdateSchema.parse({ status })).not.toThrow();
    }
  });

  it('rejects invalid status', () => {
    expect(() => orderStatusUpdateSchema.parse({ status: 'refunded' })).toThrow(ZodError);
  });

  it('rejects missing status', () => {
    expect(() => orderStatusUpdateSchema.parse({})).toThrow(ZodError);
  });
});

// ---------------------------------------------------------------------------
// Promotion schemas
// ---------------------------------------------------------------------------

describe('createPromotionSchema', () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  const furtherFuture = new Date(Date.now() + 2 * 86400000).toISOString();

  const valid = {
    code: 'SUMMER20',
    type: 'percentage' as const,
    value: 20,
    description: 'Summer sale 20% off',
    active: true,
    startsAt: future,
    expiresAt: furtherFuture,
  };

  it('accepts valid promotion', () => {
    expect(() => createPromotionSchema.parse(valid)).not.toThrow();
  });

  it('normalizes code to uppercase alphanumeric', () => {
    const result = createPromotionSchema.parse({ ...valid, code: 'summer-20!' });
    expect(result.code).toBe('SUMMER20');
  });

  it('rejects code shorter than 2 characters (after normalization)', () => {
    expect(() => createPromotionSchema.parse({ ...valid, code: 'A' })).toThrow(ZodError);
  });

  it('rejects invalid type', () => {
    expect(() => createPromotionSchema.parse({ ...valid, type: 'bogo' })).toThrow(ZodError);
  });

  it('rejects percentage discount value above 100', () => {
    expect(() => createPromotionSchema.parse({ ...valid, value: 110 })).toThrow(ZodError);
  });

  it('accepts percentage value of exactly 100', () => {
    expect(() => createPromotionSchema.parse({ ...valid, value: 100 })).not.toThrow();
  });

  it('rejects expiresAt before startsAt', () => {
    expect(() =>
      createPromotionSchema.parse({ ...valid, startsAt: furtherFuture, expiresAt: future }),
    ).toThrow(ZodError);
  });

  it('rejects missing description', () => {
    expect(() =>
      createPromotionSchema.parse({ ...valid, description: undefined }),
    ).toThrow(ZodError);
  });

  it('rejects negative value', () => {
    expect(() => createPromotionSchema.parse({ ...valid, value: -10 })).toThrow(ZodError);
  });

  it('rejects invalid datetime for startsAt', () => {
    expect(() => createPromotionSchema.parse({ ...valid, startsAt: '2024-01-01' })).toThrow(ZodError);
  });
});

describe('validatePromotionSchema', () => {
  it('accepts valid input', () => {
    expect(() => validatePromotionSchema.parse({ code: 'SAVE10', subtotal: 5000 })).not.toThrow();
  });

  it('rejects empty code', () => {
    expect(() => validatePromotionSchema.parse({ code: '', subtotal: 5000 })).toThrow(ZodError);
  });

  it('rejects missing code', () => {
    expect(() => validatePromotionSchema.parse({ subtotal: 5000 })).toThrow(ZodError);
  });

  it('rejects negative subtotal', () => {
    expect(() => validatePromotionSchema.parse({ code: 'X', subtotal: -100 })).toThrow(ZodError);
  });

  it('rejects non-integer subtotal', () => {
    expect(() => validatePromotionSchema.parse({ code: 'X', subtotal: 49.99 })).toThrow(ZodError);
  });

  it('accepts zero subtotal', () => {
    expect(() => validatePromotionSchema.parse({ code: 'X', subtotal: 0 })).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Product schema
// ---------------------------------------------------------------------------

describe('createProductSchema', () => {
  const valid = {
    name: 'Test Widget',
    slug: 'test-widget',
    description: 'A very nice test widget for testing purposes.',
    price: 999,
    category: 'Tools',
    images: ['https://example.com/img.jpg'],
  };

  it('accepts valid product', () => {
    expect(() => createProductSchema.parse(valid)).not.toThrow();
  });

  it('rejects slug with uppercase', () => {
    expect(() => createProductSchema.parse({ ...valid, slug: 'Test-Widget' })).toThrow(ZodError);
  });

  it('rejects slug with spaces', () => {
    expect(() => createProductSchema.parse({ ...valid, slug: 'test widget' })).toThrow(ZodError);
  });

  it('rejects price of 0', () => {
    expect(() => createProductSchema.parse({ ...valid, price: 0 })).toThrow(ZodError);
  });

  it('rejects negative price', () => {
    expect(() => createProductSchema.parse({ ...valid, price: -100 })).toThrow(ZodError);
  });

  it('rejects non-integer price', () => {
    expect(() => createProductSchema.parse({ ...valid, price: 9.99 })).toThrow(ZodError);
  });

  it('rejects empty images array', () => {
    expect(() => createProductSchema.parse({ ...valid, images: [] })).toThrow(ZodError);
  });

  it('rejects non-URL image', () => {
    expect(() => createProductSchema.parse({ ...valid, images: ['not-a-url'] })).toThrow(ZodError);
  });

  it('rejects description shorter than 10 characters', () => {
    expect(() => createProductSchema.parse({ ...valid, description: 'Short' })).toThrow(ZodError);
  });

  it('rejects missing name', () => {
    expect(() =>
      createProductSchema.parse({ ...valid, name: undefined }),
    ).toThrow(ZodError);
  });

  it('rejects negative stock', () => {
    expect(() => createProductSchema.parse({ ...valid, stock: -5 })).toThrow(ZodError);
  });
});
