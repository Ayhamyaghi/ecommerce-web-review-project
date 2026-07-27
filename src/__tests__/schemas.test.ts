import { describe, it, expect } from 'vitest';
import { registerSchema, loginSchema } from '@/lib/schemas/auth';
import { addToCartSchema, updateCartItemSchema } from '@/lib/schemas/cart';
import { checkoutSchema, orderStatusUpdateSchema } from '@/lib/schemas/order';
import { createReviewSchema, updateReviewSchema, reviewQuerySchema } from '@/lib/schemas/review';
import { createPromotionSchema, validatePromotionSchema } from '@/lib/schemas/promotion';
import { productQuerySchema, createProductSchema } from '@/lib/schemas/product';

describe('registerSchema', () => {
  it('accepts valid input', () => {
    const result = registerSchema.safeParse({ name: 'Alice', email: 'alice@example.com', password: 'secret123' });
    expect(result.success).toBe(true);
  });

  it('rejects name shorter than 2 chars', () => {
    const result = registerSchema.safeParse({ name: 'A', email: 'a@b.com', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerSchema.safeParse({ name: 'Alice', email: 'not-email', password: 'secret123' });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 6 chars', () => {
    const result = registerSchema.safeParse({ name: 'Alice', email: 'a@b.com', password: '12345' });
    expect(result.success).toBe(false);
  });

  it('rejects password longer than 100 chars', () => {
    const result = registerSchema.safeParse({ name: 'Alice', email: 'a@b.com', password: 'x'.repeat(101) });
    expect(result.success).toBe(false);
  });

  it('rejects empty name', () => {
    const result = registerSchema.safeParse({ name: '', email: 'a@b.com', password: 'secret123' });
    expect(result.success).toBe(false);
  });
});

describe('loginSchema', () => {
  it('accepts valid input', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: 'pass' });
    expect(result.success).toBe(true);
  });

  it('rejects empty password', () => {
    const result = loginSchema.safeParse({ email: 'user@test.com', password: '' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = loginSchema.safeParse({ email: 'bad', password: 'pass' });
    expect(result.success).toBe(false);
  });
});

describe('addToCartSchema', () => {
  it('accepts valid input', () => {
    const result = addToCartSchema.safeParse({ productId: 'p1', quantity: 1 });
    expect(result.success).toBe(true);
  });

  it('rejects quantity of 0', () => {
    const result = addToCartSchema.safeParse({ productId: 'p1', quantity: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects quantity above 99', () => {
    const result = addToCartSchema.safeParse({ productId: 'p1', quantity: 100 });
    expect(result.success).toBe(false);
  });

  it('rejects fractional quantity', () => {
    const result = addToCartSchema.safeParse({ productId: 'p1', quantity: 1.5 });
    expect(result.success).toBe(false);
  });

  it('rejects empty productId', () => {
    const result = addToCartSchema.safeParse({ productId: '', quantity: 1 });
    expect(result.success).toBe(false);
  });

  it('rejects negative quantity', () => {
    const result = addToCartSchema.safeParse({ productId: 'p1', quantity: -1 });
    expect(result.success).toBe(false);
  });
});

describe('updateCartItemSchema', () => {
  it('accepts quantity of 0 (remove item)', () => {
    const result = updateCartItemSchema.safeParse({ productId: 'p1', quantity: 0 });
    expect(result.success).toBe(true);
  });

  it('rejects quantity above 99', () => {
    const result = updateCartItemSchema.safeParse({ productId: 'p1', quantity: 100 });
    expect(result.success).toBe(false);
  });
});

describe('checkoutSchema', () => {
  const validCheckout = {
    shippingAddress: {
      firstName: 'Jane',
      lastName: 'Doe',
      address: '123 Main Street',
      city: 'Springfield',
      state: 'IL',
      postalCode: '62701',
      country: 'US',
    },
    email: 'jane@example.com',
    phone: '1234567890',
    paymentMethod: 'credit_card' as const,
  };

  it('accepts valid checkout input', () => {
    const result = checkoutSchema.safeParse(validCheckout);
    expect(result.success).toBe(true);
  });

  it('accepts checkout with promotionCode', () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, promotionCode: 'SAVE10' });
    expect(result.success).toBe(true);
  });

  it('rejects missing firstName in shippingAddress', () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      shippingAddress: { ...validCheckout.shippingAddress, firstName: '' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects short address', () => {
    const result = checkoutSchema.safeParse({
      ...validCheckout,
      shippingAddress: { ...validCheckout.shippingAddress, address: '123' },
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, email: 'bad' });
    expect(result.success).toBe(false);
  });

  it('rejects short phone', () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, phone: '123' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid payment method', () => {
    const result = checkoutSchema.safeParse({ ...validCheckout, paymentMethod: 'bitcoin' });
    expect(result.success).toBe(false);
  });

  it('accepts all valid payment methods', () => {
    for (const method of ['credit_card', 'debit_card', 'paypal']) {
      const result = checkoutSchema.safeParse({ ...validCheckout, paymentMethod: method });
      expect(result.success).toBe(true);
    }
  });

  it('rejects missing required shipping fields', () => {
    for (const field of ['lastName', 'city', 'state', 'postalCode', 'country'] as const) {
      const addr = { ...validCheckout.shippingAddress, [field]: '' };
      const result = checkoutSchema.safeParse({ ...validCheckout, shippingAddress: addr });
      expect(result.success).toBe(false);
    }
  });
});

describe('orderStatusUpdateSchema', () => {
  it('accepts valid statuses', () => {
    for (const status of ['pending', 'processing', 'shipped', 'delivered', 'cancelled']) {
      expect(orderStatusUpdateSchema.safeParse({ status }).success).toBe(true);
    }
  });

  it('rejects invalid status', () => {
    expect(orderStatusUpdateSchema.safeParse({ status: 'refunded' }).success).toBe(false);
  });
});

describe('createReviewSchema', () => {
  it('accepts valid review input', () => {
    const result = createReviewSchema.safeParse({
      productId: 'p1',
      rating: 5,
      title: 'Great product',
      body: 'I really love this product very much',
    });
    expect(result.success).toBe(true);
  });

  it('rejects rating of 0', () => {
    expect(createReviewSchema.safeParse({ productId: 'p1', rating: 0, title: 'Hi there', body: 'Good product here' }).success).toBe(false);
  });

  it('rejects rating above 5', () => {
    expect(createReviewSchema.safeParse({ productId: 'p1', rating: 6, title: 'Hi there', body: 'Good product here' }).success).toBe(false);
  });

  it('rejects fractional rating', () => {
    expect(createReviewSchema.safeParse({ productId: 'p1', rating: 3.5, title: 'Hi there', body: 'Good product here' }).success).toBe(false);
  });

  it('rejects title shorter than 3 chars', () => {
    expect(createReviewSchema.safeParse({ productId: 'p1', rating: 4, title: 'Hi', body: 'Good product here' }).success).toBe(false);
  });

  it('rejects body shorter than 10 chars', () => {
    expect(createReviewSchema.safeParse({ productId: 'p1', rating: 4, title: 'Good title', body: 'Short' }).success).toBe(false);
  });

  it('rejects title over 100 chars', () => {
    expect(createReviewSchema.safeParse({ productId: 'p1', rating: 4, title: 'x'.repeat(101), body: 'Good product here' }).success).toBe(false);
  });

  it('rejects body over 2000 chars', () => {
    expect(createReviewSchema.safeParse({ productId: 'p1', rating: 4, title: 'Good', body: 'x'.repeat(2001) }).success).toBe(false);
  });
});

describe('updateReviewSchema', () => {
  it('accepts partial updates', () => {
    expect(updateReviewSchema.safeParse({ rating: 3 }).success).toBe(true);
    expect(updateReviewSchema.safeParse({ title: 'New title' }).success).toBe(true);
    expect(updateReviewSchema.safeParse({}).success).toBe(true);
  });

  it('accepts status field', () => {
    expect(updateReviewSchema.safeParse({ status: 'approved' }).success).toBe(true);
    expect(updateReviewSchema.safeParse({ status: 'rejected' }).success).toBe(true);
    expect(updateReviewSchema.safeParse({ status: 'pending' }).success).toBe(true);
  });

  it('rejects invalid status', () => {
    expect(updateReviewSchema.safeParse({ status: 'deleted' }).success).toBe(false);
  });
});

describe('reviewQuerySchema', () => {
  it('provides defaults for empty input', () => {
    const result = reviewQuerySchema.parse({});
    expect(result.sort).toBe('newest');
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });

  it('coerces string page to number', () => {
    const result = reviewQuerySchema.parse({ page: '3' });
    expect(result.page).toBe(3);
  });

  it('rejects page below 1', () => {
    expect(reviewQuerySchema.safeParse({ page: '0' }).success).toBe(false);
  });

  it('rejects pageSize above 50', () => {
    expect(reviewQuerySchema.safeParse({ pageSize: '51' }).success).toBe(false);
  });
});

describe('createPromotionSchema', () => {
  const validPromo = {
    code: 'SAVE20',
    type: 'percentage' as const,
    value: 20,
    minOrderAmount: 1000,
    description: '20% off everything',
    active: true,
    startsAt: '2024-01-01T00:00:00Z',
    expiresAt: '2025-12-31T23:59:59Z',
  };

  it('accepts valid promotion', () => {
    const result = createPromotionSchema.safeParse(validPromo);
    expect(result.success).toBe(true);
  });

  it('transforms code to uppercase and strips non-alphanumeric', () => {
    const result = createPromotionSchema.parse({ ...validPromo, code: 'save-20!' });
    expect(result.code).toBe('SAVE20');
  });

  it('rejects code shorter than 2 chars', () => {
    expect(createPromotionSchema.safeParse({ ...validPromo, code: 'A' }).success).toBe(false);
  });

  it('rejects invalid type', () => {
    expect(createPromotionSchema.safeParse({ ...validPromo, type: 'bogo' }).success).toBe(false);
  });

  it('rejects negative value', () => {
    expect(createPromotionSchema.safeParse({ ...validPromo, value: -10 }).success).toBe(false);
  });

  it('rejects invalid datetime strings', () => {
    expect(createPromotionSchema.safeParse({ ...validPromo, startsAt: 'not-a-date' }).success).toBe(false);
  });
});

describe('validatePromotionSchema', () => {
  it('accepts valid input', () => {
    const result = validatePromotionSchema.safeParse({ code: 'SAVE10', subtotal: 5000 });
    expect(result.success).toBe(true);
  });

  it('rejects empty code', () => {
    expect(validatePromotionSchema.safeParse({ code: '', subtotal: 5000 }).success).toBe(false);
  });

  it('rejects negative subtotal', () => {
    expect(validatePromotionSchema.safeParse({ code: 'SAVE10', subtotal: -100 }).success).toBe(false);
  });
});

describe('productQuerySchema', () => {
  it('provides defaults for empty input', () => {
    const result = productQuerySchema.parse({});
    expect(result.search).toBe('');
    expect(result.sort).toBe('relevance');
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(12);
  });

  it('coerces string values for numeric params', () => {
    const result = productQuerySchema.parse({ page: '2', pageSize: '24', minPrice: '100' });
    expect(result.page).toBe(2);
    expect(result.pageSize).toBe(24);
    expect(result.minPrice).toBe(100);
  });

  it('rejects page below 1', () => {
    expect(productQuerySchema.safeParse({ page: '0' }).success).toBe(false);
  });

  it('rejects pageSize above 100', () => {
    expect(productQuerySchema.safeParse({ pageSize: '101' }).success).toBe(false);
  });

  it('accepts valid sort options', () => {
    for (const sort of ['relevance', 'price-asc', 'price-desc', 'name-asc', 'name-desc', 'newest']) {
      expect(productQuerySchema.safeParse({ sort }).success).toBe(true);
    }
  });

  it('rejects invalid sort option', () => {
    expect(productQuerySchema.safeParse({ sort: 'popularity' }).success).toBe(false);
  });
});

describe('createProductSchema', () => {
  const validProduct = {
    name: 'Test Product',
    slug: 'test-product',
    description: 'A great test product for testing purposes',
    price: 1999,
    category: 'Electronics',
    images: ['https://example.com/img.jpg'],
  };

  it('accepts valid product', () => {
    const result = createProductSchema.safeParse(validProduct);
    expect(result.success).toBe(true);
  });

  it('rejects slug with uppercase', () => {
    expect(createProductSchema.safeParse({ ...validProduct, slug: 'Test-Product' }).success).toBe(false);
  });

  it('rejects slug with spaces', () => {
    expect(createProductSchema.safeParse({ ...validProduct, slug: 'test product' }).success).toBe(false);
  });

  it('rejects price of 0', () => {
    expect(createProductSchema.safeParse({ ...validProduct, price: 0 }).success).toBe(false);
  });

  it('rejects fractional price', () => {
    expect(createProductSchema.safeParse({ ...validProduct, price: 19.99 }).success).toBe(false);
  });

  it('rejects empty images array', () => {
    expect(createProductSchema.safeParse({ ...validProduct, images: [] }).success).toBe(false);
  });

  it('rejects non-URL images', () => {
    expect(createProductSchema.safeParse({ ...validProduct, images: ['not-a-url'] }).success).toBe(false);
  });

  it('rejects description shorter than 10 chars', () => {
    expect(createProductSchema.safeParse({ ...validProduct, description: 'Short' }).success).toBe(false);
  });

  it('provides defaults for optional fields', () => {
    const result = createProductSchema.parse(validProduct);
    expect(result.featured).toBe(false);
    expect(result.status).toBe('active');
    expect(result.stock).toBe(0);
    expect(result.tags).toEqual([]);
  });
});
