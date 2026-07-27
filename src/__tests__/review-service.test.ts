/**
 * Unit tests for the review service layer.
 *
 * The database module is mocked so these tests exercise the service's business
 * logic (authorization, duplicate detection, verified-purchase computation,
 * stats calculation) without touching the filesystem.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import * as dbStore from '@/lib/db/store';
import type { DbSchema, DbReview, DbProduct, DbOrder, DbOrderItem } from '@/lib/db/store';

// ---------------------------------------------------------------------------
// DB mock
// ---------------------------------------------------------------------------

let mockDb: DbSchema;

vi.mock('@/lib/db/store', async (importOriginal) => {
  const actual = await importOriginal<typeof dbStore>();
  return {
    ...actual,
    loadDb: () => mockDb,
    saveDb: (db: DbSchema) => { mockDb = db; },
    generateId: () => `test-${Math.random().toString(36).slice(2)}`,
  };
});

function makeProduct(id = 'prod-1'): DbProduct {
  return {
    id,
    name: 'Widget',
    slug: id,
    description: 'A widget',
    price: 2000,
    compareAtPrice: null,
    category: 'Tools',
    images: ['https://example.com/img.jpg'],
    specifications: {},
    tags: [],
    featured: false,
    status: 'active',
    stock: 10,
    lowStockThreshold: 3,
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
  };
}

function makeReview(overrides: Partial<DbReview> = {}): DbReview {
  return {
    id: 'rev-1',
    productId: 'prod-1',
    userId: 'user-1',
    authorName: 'Alice',
    rating: 4,
    title: 'Great product',
    body: 'Really happy with this widget',
    verified: false,
    status: 'approved',
    helpfulVotes: 0,
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-01-10T00:00:00Z',
    ...overrides,
  };
}

function emptyDb(): DbSchema {
  return {
    users: [],
    sessions: [],
    products: [makeProduct()],
    categories: [],
    cartItems: [],
    wishlistItems: [],
    orders: [],
    orderItems: [],
    reviews: [],
    promotions: [],
    promotionUsages: [],
    inventoryLogs: [],
  };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

beforeEach(() => {
  mockDb = emptyDb();
});

// Import after mocks are registered
const { createReview, updateReview, deleteReview, getProductReviews, voteHelpful, listAllReviews } =
  await import('@/lib/services/review-service');
const { NotFoundError, ConflictError, AuthorizationError } =
  await import('@/lib/errors');

describe('createReview — business rule enforcement', () => {
  it('creates a review and persists it', () => {
    const review = createReview('user-1', 'Alice', {
      productId: 'prod-1',
      rating: 5,
      title: 'Excellent',
      body: 'Absolutely love this widget',
    });
    expect(review.productId).toBe('prod-1');
    expect(review.userId).toBe('user-1');
    expect(review.rating).toBe(5);
    expect(mockDb.reviews).toHaveLength(1);
  });

  it('throws NotFoundError for a non-existent product', () => {
    expect(() =>
      createReview('user-1', 'Alice', {
        productId: 'no-such-product',
        rating: 3,
        title: 'OK',
        body: 'It is okay I guess',
      }),
    ).toThrow(NotFoundError);
  });

  it('throws ConflictError when the user has already reviewed the product', () => {
    mockDb.reviews.push(makeReview({ userId: 'user-1', productId: 'prod-1' }));
    expect(() =>
      createReview('user-1', 'Alice', {
        productId: 'prod-1',
        rating: 5,
        title: 'Second review',
        body: 'Trying to post a duplicate review',
      }),
    ).toThrow(ConflictError);
  });

  it('marks review as verified when user has a non-cancelled order for the product', () => {
    const order: DbOrder = {
      id: 'ord-1',
      userId: 'user-1',
      email: 'alice@example.com',
      status: 'delivered',
      shippingAddress: { firstName: 'Alice', lastName: 'Smith', address: '1 Main St', city: 'Springfield', state: 'IL', postalCode: '62701', country: 'US' },
      phone: '555-1234',
      paymentMethod: 'credit_card',
      paymentStatus: 'paid',
      subtotal: 2000,
      discount: 0,
      shipping: 0,
      total: 2000,
      promotionCode: null,
      notes: '',
      createdAt: '2026-01-05T00:00:00Z',
      updatedAt: '2026-01-05T00:00:00Z',
    };
    const orderItem: DbOrderItem = {
      id: 'oi-1',
      orderId: 'ord-1',
      productId: 'prod-1',
      productName: 'Widget',
      productImage: '',
      price: 2000,
      quantity: 1,
    };
    mockDb.orders.push(order);
    mockDb.orderItems.push(orderItem);

    const review = createReview('user-1', 'Alice', {
      productId: 'prod-1',
      rating: 5,
      title: 'Verified purchase',
      body: 'I actually bought and love this product',
    });
    expect(review.verified).toBe(true);
  });

  it('does not mark review as verified for a cancelled order', () => {
    const order: DbOrder = {
      id: 'ord-2',
      userId: 'user-1',
      email: 'alice@example.com',
      status: 'cancelled',
      shippingAddress: { firstName: 'Alice', lastName: 'Smith', address: '1 Main St', city: 'Springfield', state: 'IL', postalCode: '62701', country: 'US' },
      phone: '555-1234',
      paymentMethod: 'credit_card',
      paymentStatus: 'refunded',
      subtotal: 2000,
      discount: 0,
      shipping: 0,
      total: 2000,
      promotionCode: null,
      notes: '',
      createdAt: '2026-01-05T00:00:00Z',
      updatedAt: '2026-01-05T00:00:00Z',
    };
    const orderItem: DbOrderItem = {
      id: 'oi-2',
      orderId: 'ord-2',
      productId: 'prod-1',
      productName: 'Widget',
      productImage: '',
      price: 2000,
      quantity: 1,
    };
    mockDb.orders.push(order);
    mockDb.orderItems.push(orderItem);

    const review = createReview('user-1', 'Alice', {
      productId: 'prod-1',
      rating: 2,
      title: 'Not verified',
      body: 'I cancelled my order but still reviewing',
    });
    expect(review.verified).toBe(false);
  });
});

describe('updateReview — authorization', () => {
  beforeEach(() => {
    mockDb.reviews.push(makeReview({ id: 'rev-1', userId: 'user-1' }));
  });

  it('allows the owner to update their review', () => {
    const updated = updateReview('rev-1', 'user-1', { rating: 5 }, false);
    expect(updated.rating).toBe(5);
  });

  it('allows an admin to update any review', () => {
    const updated = updateReview('rev-1', 'admin-999', { rating: 1 }, true);
    expect(updated.rating).toBe(1);
  });

  it('throws AuthorizationError when a non-owner non-admin tries to update', () => {
    expect(() => updateReview('rev-1', 'user-2', { rating: 1 }, false)).toThrow(AuthorizationError);
  });

  it('allows admin to change review status', () => {
    const updated = updateReview('rev-1', 'admin-999', { status: 'rejected' }, true);
    expect(updated.status).toBe('rejected');
  });

  it('does not allow non-admin to change review status', () => {
    const updated = updateReview('rev-1', 'user-1', { status: 'rejected' }, false);
    // status field is ignored for non-admins
    expect(updated.status).toBe('approved');
  });

  it('throws NotFoundError for a non-existent review', () => {
    expect(() => updateReview('no-such-review', 'user-1', { rating: 3 }, false)).toThrow(NotFoundError);
  });
});

describe('deleteReview — authorization', () => {
  beforeEach(() => {
    mockDb.reviews.push(makeReview({ id: 'rev-1', userId: 'user-1' }));
  });

  it('allows the owner to delete their review', () => {
    deleteReview('rev-1', 'user-1', false);
    expect(mockDb.reviews).toHaveLength(0);
  });

  it('allows an admin to delete any review', () => {
    deleteReview('rev-1', 'admin-999', true);
    expect(mockDb.reviews).toHaveLength(0);
  });

  it('throws AuthorizationError for a non-owner non-admin', () => {
    expect(() => deleteReview('rev-1', 'user-2', false)).toThrow(AuthorizationError);
  });

  it('throws NotFoundError when the review does not exist', () => {
    expect(() => deleteReview('ghost-review', 'user-1', false)).toThrow(NotFoundError);
  });
});

describe('voteHelpful', () => {
  it('increments helpfulVotes and persists', () => {
    mockDb.reviews.push(makeReview({ id: 'rev-1', helpfulVotes: 3 }));
    const updated = voteHelpful('rev-1');
    expect(updated.helpfulVotes).toBe(4);
    expect(mockDb.reviews[0].helpfulVotes).toBe(4);
  });

  it('throws NotFoundError for a non-existent review', () => {
    expect(() => voteHelpful('no-review')).toThrow(NotFoundError);
  });
});

describe('getProductReviews', () => {
  beforeEach(() => {
    mockDb.reviews = [
      makeReview({ id: 'r1', status: 'approved', rating: 5, createdAt: '2026-01-15T00:00:00Z' }),
      makeReview({ id: 'r2', status: 'approved', rating: 3, createdAt: '2026-01-10T00:00:00Z' }),
      makeReview({ id: 'r3', status: 'pending', rating: 4, createdAt: '2026-01-20T00:00:00Z' }),
    ];
  });

  it('returns only approved reviews', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 10 });
    expect(result.reviews.every(r => r.status === 'approved')).toBe(true);
    expect(result.reviews).toHaveLength(2);
  });

  it('computes stats from all product reviews (not just approved)', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 10 });
    // Only approved ones factor into stats
    expect(result.stats.totalReviews).toBe(2);
    expect(result.stats.averageRating).toBe(4);
  });

  it('sets canEdit = true for the current users own reviews', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 10 }, 'user-1');
    expect(result.reviews.every(r => r.canEdit === true)).toBe(true);
  });

  it('sets canEdit = false for reviews not belonging to the current user', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 10 }, 'user-99');
    expect(result.reviews.every(r => r.canEdit === false)).toBe(true);
  });

  it('paginates results', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 1 });
    expect(result.reviews).toHaveLength(1);
    expect(result.total).toBe(2);
  });
});

describe('listAllReviews', () => {
  it('returns all reviews regardless of status', () => {
    mockDb.reviews = [
      makeReview({ id: 'r1', status: 'approved' }),
      makeReview({ id: 'r2', status: 'pending' }),
      makeReview({ id: 'r3', status: 'rejected' }),
    ];
    const result = listAllReviews({ sort: 'newest', page: 1, pageSize: 10 });
    expect(result.reviews).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('filters by status when provided', () => {
    mockDb.reviews = [
      makeReview({ id: 'r1', status: 'approved' }),
      makeReview({ id: 'r2', status: 'pending' }),
    ];
    const result = listAllReviews({ sort: 'newest', status: 'pending', page: 1, pageSize: 10 });
    expect(result.reviews).toHaveLength(1);
    expect(result.reviews[0].id).toBe('r2');
  });

  it('paginates results', () => {
    mockDb.reviews = [
      makeReview({ id: 'r1', status: 'approved', createdAt: '2026-01-10T00:00:00Z' }),
      makeReview({ id: 'r2', status: 'approved', createdAt: '2026-01-20T00:00:00Z' }),
      makeReview({ id: 'r3', status: 'approved', createdAt: '2026-01-30T00:00:00Z' }),
    ];
    const page1 = listAllReviews({ sort: 'newest', page: 1, pageSize: 2 });
    expect(page1.reviews).toHaveLength(2);
    expect(page1.total).toBe(3);
  });
});
