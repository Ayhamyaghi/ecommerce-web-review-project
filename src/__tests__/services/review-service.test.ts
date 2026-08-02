import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, loadDb, saveDb } from '@/lib/db/store';
import {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview,
  voteHelpful,
  listAllReviews,
} from '@/lib/services/review-service';
import { NotFoundError, ConflictError, AuthorizationError } from '@/lib/errors';

function seedData() {
  const db = loadDb();
  const now = new Date().toISOString();
  db.products.push(
    { id: 'prod-1', name: 'Widget', slug: 'widget', description: 'A widget', price: 1999, compareAtPrice: null, category: 'Tools', images: ['/img.jpg'], specifications: {}, tags: [], featured: false, status: 'active', stock: 10, lowStockThreshold: 3, createdAt: now, updatedAt: now },
  );
  db.users.push(
    { id: 'user-1', email: 'alice@example.com', name: 'Alice', passwordHash: 'hash', role: 'USER', createdAt: now },
    { id: 'user-2', email: 'bob@example.com', name: 'Bob', passwordHash: 'hash', role: 'USER', createdAt: now },
    { id: 'user-admin', email: 'admin@example.com', name: 'Admin', passwordHash: 'hash', role: 'ADMIN', createdAt: now },
  );
  db.reviews.push(
    { id: 'rev-1', productId: 'prod-1', userId: 'user-1', authorName: 'Alice', rating: 5, title: 'Great product', body: 'I love this product so much', verified: true, status: 'approved', helpfulVotes: 10, createdAt: '2024-01-15T00:00:00Z', updatedAt: '2024-01-15T00:00:00Z' },
    { id: 'rev-2', productId: 'prod-1', userId: 'user-2', authorName: 'Bob', rating: 3, title: 'Decent product', body: 'It is okay but nothing special', verified: false, status: 'approved', helpfulVotes: 2, createdAt: '2024-01-20T00:00:00Z', updatedAt: '2024-01-20T00:00:00Z' },
    { id: 'rev-3', productId: 'prod-1', userId: 'user-admin', authorName: 'Admin', rating: 4, title: 'Pending review', body: 'Awaiting moderation approval', verified: false, status: 'pending', helpfulVotes: 0, createdAt: '2024-01-25T00:00:00Z', updatedAt: '2024-01-25T00:00:00Z' },
  );
  // user-1 has an order for prod-1
  db.orders.push({ id: 'ord-1', userId: 'user-1', email: 'alice@example.com', status: 'delivered', shippingAddress: { firstName: 'Alice', lastName: 'A', address: '123 Main St', city: 'NY', state: 'NY', postalCode: '10001', country: 'US' }, phone: '1234567890', paymentMethod: 'credit_card', paymentStatus: 'paid', subtotal: 1999, discount: 0, shipping: 0, total: 1999, promotionCode: null, notes: '', createdAt: now, updatedAt: now });
  db.orderItems.push({ id: 'oi-1', orderId: 'ord-1', productId: 'prod-1', productName: 'Widget', productImage: '/img.jpg', price: 1999, quantity: 1 });
  saveDb(db);
}

beforeEach(() => {
  resetDb();
  seedData();
});

describe('getProductReviews', () => {
  it('returns only approved reviews for a product', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 10 });
    expect(result.reviews).toHaveLength(2);
    expect(result.reviews.every((r: { status?: string }) => !r.status || r.status !== 'pending')).toBe(true);
  });

  it('returns review stats including all statuses', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 10 });
    expect(result.stats.totalReviews).toBe(2); // only approved counted in stats
    expect(result.stats.averageRating).toBe(4); // (5+3)/2
  });

  it('sorts by newest first', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 10 });
    expect(result.reviews[0].authorName).toBe('Bob'); // newer
  });

  it('sorts by oldest first', () => {
    const result = getProductReviews('prod-1', { sort: 'oldest', page: 1, pageSize: 10 });
    expect(result.reviews[0].authorName).toBe('Alice'); // older
  });

  it('sorts by highest rating', () => {
    const result = getProductReviews('prod-1', { sort: 'highest', page: 1, pageSize: 10 });
    expect(result.reviews[0].rating).toBe(5);
  });

  it('sorts by lowest rating', () => {
    const result = getProductReviews('prod-1', { sort: 'lowest', page: 1, pageSize: 10 });
    expect(result.reviews[0].rating).toBe(3);
  });

  it('sorts by most helpful', () => {
    const result = getProductReviews('prod-1', { sort: 'most-helpful', page: 1, pageSize: 10 });
    expect(result.reviews[0].helpfulVotes).toBe(10);
  });

  it('paginates results', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 1 });
    expect(result.reviews).toHaveLength(1);
    expect(result.total).toBe(2);
  });

  it('marks canEdit true for own reviews', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 10 }, 'user-1');
    const aliceReview = result.reviews.find((r: { authorName: string }) => r.authorName === 'Alice');
    expect(aliceReview).toBeDefined();
    expect(aliceReview!.canEdit).toBe(true);
  });

  it('marks canEdit false for others reviews', () => {
    const result = getProductReviews('prod-1', { sort: 'newest', page: 1, pageSize: 10 }, 'user-1');
    const bobReview = result.reviews.find((r: { authorName: string }) => r.authorName === 'Bob');
    expect(bobReview).toBeDefined();
    expect(bobReview!.canEdit).toBe(false);
  });

  it('returns empty for product with no reviews', () => {
    const result = getProductReviews('prod-no-reviews', { sort: 'newest', page: 1, pageSize: 10 });
    expect(result.reviews).toHaveLength(0);
    expect(result.stats.totalReviews).toBe(0);
    expect(result.stats.averageRating).toBe(0);
  });
});

describe('createReview', () => {
  it('creates a review for a product', () => {
    // user-2 has no existing review for prod-1... wait, they do (rev-2)
    // Let's use a new product
    const db = loadDb();
    db.products.push({ id: 'prod-2', name: 'Gadget', slug: 'gadget', description: 'A gadget', price: 4999, compareAtPrice: null, category: 'Electronics', images: [], specifications: {}, tags: [], featured: false, status: 'active', stock: 5, lowStockThreshold: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    saveDb(db);
    const review = createReview('user-1', 'Alice', { productId: 'prod-2', rating: 4, title: 'Good gadget', body: 'This is a decent gadget for the price' });
    expect(review.id).toBeTruthy();
    expect(review.productId).toBe('prod-2');
    expect(review.rating).toBe(4);
    expect(review.status).toBe('approved');
    expect(review.helpfulVotes).toBe(0);
  });

  it('marks review as verified when user has ordered the product', () => {
    const db = loadDb();
    db.products.push({ id: 'prod-2', name: 'Gadget', slug: 'gadget', description: 'A gadget', price: 4999, compareAtPrice: null, category: 'Electronics', images: [], specifications: {}, tags: [], featured: false, status: 'active', stock: 5, lowStockThreshold: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    db.orders.push({ id: 'ord-2', userId: 'user-2', email: 'bob@example.com', status: 'delivered', shippingAddress: { firstName: 'Bob', lastName: 'B', address: '456 Oak St', city: 'LA', state: 'CA', postalCode: '90001', country: 'US' }, phone: '0987654321', paymentMethod: 'paypal', paymentStatus: 'paid', subtotal: 4999, discount: 0, shipping: 0, total: 4999, promotionCode: null, notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    db.orderItems.push({ id: 'oi-2', orderId: 'ord-2', productId: 'prod-2', productName: 'Gadget', productImage: '', price: 4999, quantity: 1 });
    saveDb(db);
    const review = createReview('user-2', 'Bob', { productId: 'prod-2', rating: 5, title: 'Verified awesome', body: 'I bought this and it is amazing' });
    expect(review.verified).toBe(true);
  });

  it('marks review as not verified when user has not ordered', () => {
    const db = loadDb();
    db.products.push({ id: 'prod-2', name: 'Gadget', slug: 'gadget', description: 'A gadget', price: 4999, compareAtPrice: null, category: 'Electronics', images: [], specifications: {}, tags: [], featured: false, status: 'active', stock: 5, lowStockThreshold: 2, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    saveDb(db);
    const review = createReview('user-2', 'Bob', { productId: 'prod-2', rating: 3, title: 'Not verified', body: 'I never bought this but still reviewing' });
    expect(review.verified).toBe(false);
  });

  it('throws NotFoundError for non-existent product', () => {
    expect(() => createReview('user-1', 'Alice', { productId: 'prod-nonexistent', rating: 5, title: 'Review title', body: 'This product does not exist at all' })).toThrow(NotFoundError);
  });

  it('throws ConflictError when user already reviewed the product', () => {
    // user-1 already has rev-1 for prod-1
    expect(() => createReview('user-1', 'Alice', { productId: 'prod-1', rating: 4, title: 'Second review', body: 'I want to review this again but cant' })).toThrow(ConflictError);
  });

  it('does not count cancelled orders as verified purchase', () => {
    const db = loadDb();
    db.products.push({ id: 'prod-3', name: 'Thing', slug: 'thing', description: 'A thing', price: 999, compareAtPrice: null, category: 'Other', images: [], specifications: {}, tags: [], featured: false, status: 'active', stock: 10, lowStockThreshold: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    db.orders.push({ id: 'ord-cancelled', userId: 'user-2', email: 'bob@example.com', status: 'cancelled', shippingAddress: { firstName: 'Bob', lastName: 'B', address: '456 Oak St', city: 'LA', state: 'CA', postalCode: '90001', country: 'US' }, phone: '0987654321', paymentMethod: 'paypal', paymentStatus: 'refunded', subtotal: 999, discount: 0, shipping: 0, total: 999, promotionCode: null, notes: '', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    db.orderItems.push({ id: 'oi-cancelled', orderId: 'ord-cancelled', productId: 'prod-3', productName: 'Thing', productImage: '', price: 999, quantity: 1 });
    saveDb(db);
    const review = createReview('user-2', 'Bob', { productId: 'prod-3', rating: 3, title: 'Cancelled order', body: 'I cancelled this order but reviewing anyway' });
    expect(review.verified).toBe(false);
  });
});

describe('updateReview', () => {
  it('allows owner to update their review', () => {
    const updated = updateReview('rev-1', 'user-1', { rating: 4 });
    expect(updated.rating).toBe(4);
    expect(updated.title).toBe('Great product'); // unchanged
  });

  it('throws NotFoundError for non-existent review', () => {
    expect(() => updateReview('rev-nonexistent', 'user-1', { rating: 3 })).toThrow(NotFoundError);
  });

  it('throws AuthorizationError when non-owner tries to update', () => {
    expect(() => updateReview('rev-1', 'user-2', { rating: 1 })).toThrow(AuthorizationError);
  });

  it('allows admin to update any review', () => {
    const updated = updateReview('rev-2', 'user-admin', { rating: 5 }, true);
    expect(updated.rating).toBe(5);
  });

  it('allows admin to change review status', () => {
    const updated = updateReview('rev-3', 'user-admin', { status: 'approved' }, true);
    expect(updated.status).toBe('approved');
  });

  it('non-admin cannot change status', () => {
    const updated = updateReview('rev-1', 'user-1', { status: 'rejected' });
    expect(updated.status).toBe('approved'); // unchanged, status update ignored for non-admin
  });

  it('updates multiple fields at once', () => {
    const updated = updateReview('rev-1', 'user-1', { rating: 3, title: 'Updated title', body: 'Updated body content here' });
    expect(updated.rating).toBe(3);
    expect(updated.title).toBe('Updated title');
    expect(updated.body).toBe('Updated body content here');
  });
});

describe('deleteReview', () => {
  it('allows owner to delete their review', () => {
    deleteReview('rev-1', 'user-1', false);
    const db = loadDb();
    expect(db.reviews.find(r => r.id === 'rev-1')).toBeUndefined();
  });

  it('throws NotFoundError for non-existent review', () => {
    expect(() => deleteReview('rev-nonexistent', 'user-1', false)).toThrow(NotFoundError);
  });

  it('throws AuthorizationError when non-owner tries to delete', () => {
    expect(() => deleteReview('rev-1', 'user-2', false)).toThrow(AuthorizationError);
  });

  it('allows admin to delete any review', () => {
    deleteReview('rev-2', 'user-admin', true);
    const db = loadDb();
    expect(db.reviews.find(r => r.id === 'rev-2')).toBeUndefined();
  });
});

describe('voteHelpful', () => {
  it('increments helpful votes', () => {
    const result = voteHelpful('rev-1');
    expect(result.helpfulVotes).toBe(11); // was 10
  });

  it('throws NotFoundError for non-existent review', () => {
    expect(() => voteHelpful('rev-nonexistent')).toThrow(NotFoundError);
  });

  it('allows voting multiple times (no user check)', () => {
    voteHelpful('rev-2');
    const result = voteHelpful('rev-2');
    expect(result.helpfulVotes).toBe(4); // was 2
  });
});

describe('listAllReviews', () => {
  it('returns all reviews sorted by newest', () => {
    const result = listAllReviews({ sort: 'newest', page: 1, pageSize: 10 });
    expect(result.reviews).toHaveLength(3);
    expect(result.total).toBe(3);
  });

  it('filters by status', () => {
    const result = listAllReviews({ sort: 'newest', page: 1, pageSize: 10, status: 'pending' });
    expect(result.reviews).toHaveLength(1);
    expect(result.reviews[0].id).toBe('rev-3');
  });

  it('filters by productId', () => {
    const result = listAllReviews({ sort: 'newest', page: 1, pageSize: 10, productId: 'prod-1' });
    expect(result.reviews).toHaveLength(3);
  });

  it('paginates results', () => {
    const result = listAllReviews({ sort: 'newest', page: 1, pageSize: 2 });
    expect(result.reviews).toHaveLength(2);
    expect(result.total).toBe(3);
  });

  it('returns empty for page beyond total', () => {
    const result = listAllReviews({ sort: 'newest', page: 10, pageSize: 10 });
    expect(result.reviews).toHaveLength(0);
    expect(result.total).toBe(3);
  });
});
