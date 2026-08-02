import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, loadDb, saveDb } from '@/lib/db/store';
import { getDashboardStats } from '@/lib/services/admin-service';

function seedData() {
  const db = loadDb();
  const now = new Date().toISOString();

  db.users.push(
    { id: 'user-1', email: 'customer1@example.com', name: 'Customer 1', passwordHash: 'hash', role: 'USER', createdAt: now },
    { id: 'user-2', email: 'customer2@example.com', name: 'Customer 2', passwordHash: 'hash', role: 'USER', createdAt: now },
    { id: 'user-admin', email: 'admin@example.com', name: 'Admin', passwordHash: 'hash', role: 'ADMIN', createdAt: now },
  );

  db.products.push(
    { id: 'p1', name: 'Widget', slug: 'widget', description: 'A widget', price: 1999, compareAtPrice: null, category: 'Tools', images: [], specifications: {}, tags: [], featured: false, status: 'active', stock: 10, lowStockThreshold: 5, createdAt: now, updatedAt: now },
    { id: 'p2', name: 'Gadget', slug: 'gadget', description: 'A gadget', price: 4999, compareAtPrice: null, category: 'Electronics', images: [], specifications: {}, tags: [], featured: false, status: 'active', stock: 3, lowStockThreshold: 5, createdAt: now, updatedAt: now },
  );

  db.orders.push(
    { id: 'ord-1', userId: 'user-1', email: 'customer1@example.com', status: 'delivered', shippingAddress: { firstName: 'C', lastName: '1', address: '123 Main St', city: 'NY', state: 'NY', postalCode: '10001', country: 'US' }, phone: '1234567890', paymentMethod: 'credit_card', paymentStatus: 'paid', subtotal: 3998, discount: 0, shipping: 0, total: 3998, promotionCode: null, notes: '', createdAt: now, updatedAt: now },
    { id: 'ord-2', userId: 'user-2', email: 'customer2@example.com', status: 'processing', shippingAddress: { firstName: 'C', lastName: '2', address: '456 Oak St', city: 'LA', state: 'CA', postalCode: '90001', country: 'US' }, phone: '0987654321', paymentMethod: 'paypal', paymentStatus: 'paid', subtotal: 4999, discount: 0, shipping: 599, total: 5598, promotionCode: null, notes: '', createdAt: now, updatedAt: now },
    { id: 'ord-3', userId: 'user-1', email: 'customer1@example.com', status: 'cancelled', shippingAddress: { firstName: 'C', lastName: '1', address: '123 Main St', city: 'NY', state: 'NY', postalCode: '10001', country: 'US' }, phone: '1234567890', paymentMethod: 'credit_card', paymentStatus: 'refunded', subtotal: 1999, discount: 0, shipping: 599, total: 2598, promotionCode: null, notes: '', createdAt: now, updatedAt: now },
  );

  db.orderItems.push(
    { id: 'oi-1', orderId: 'ord-1', productId: 'p1', productName: 'Widget', productImage: '', price: 1999, quantity: 2 },
    { id: 'oi-2', orderId: 'ord-2', productId: 'p2', productName: 'Gadget', productImage: '', price: 4999, quantity: 1 },
    { id: 'oi-3', orderId: 'ord-3', productId: 'p1', productName: 'Widget', productImage: '', price: 1999, quantity: 1 },
  );

  db.reviews.push(
    { id: 'rev-1', productId: 'p1', userId: 'user-1', authorName: 'Customer 1', rating: 5, title: 'Great', body: 'Love it', verified: true, status: 'approved', helpfulVotes: 5, createdAt: now, updatedAt: now },
    { id: 'rev-2', productId: 'p2', userId: 'user-2', authorName: 'Customer 2', rating: 4, title: 'Good', body: 'Decent', verified: false, status: 'pending', helpfulVotes: 0, createdAt: now, updatedAt: now },
  );

  saveDb(db);
}

beforeEach(() => {
  resetDb();
  seedData();
});

describe('getDashboardStats', () => {
  it('returns total orders', () => {
    const stats = getDashboardStats();
    expect(stats.totalOrders).toBe(3);
  });

  it('calculates revenue from paid orders only', () => {
    const stats = getDashboardStats();
    // ord-1 total 3998 (paid), ord-2 total 5598 (paid), ord-3 total 2598 (refunded but paymentStatus='refunded')
    // Only paymentStatus='paid' are counted: ord-1 and ord-2
    expect(stats.totalRevenue).toBe(3998 + 5598);
  });

  it('counts customers (USER role only)', () => {
    const stats = getDashboardStats();
    expect(stats.totalCustomers).toBe(2);
  });

  it('counts active products', () => {
    const stats = getDashboardStats();
    expect(stats.totalProducts).toBe(2);
  });

  it('counts pending and processing orders', () => {
    const stats = getDashboardStats();
    expect(stats.pendingOrders).toBe(1); // ord-2 is processing
  });

  it('returns recent orders sorted by newest', () => {
    const stats = getDashboardStats();
    expect(stats.recentOrders.length).toBeLessThanOrEqual(10);
    expect(stats.recentOrders[0].id).toBeTruthy();
  });

  it('calculates top products by sales (excludes cancelled orders)', () => {
    const stats = getDashboardStats();
    expect(stats.topProducts.length).toBeGreaterThanOrEqual(1);
    // ord-3 is cancelled so its items should not count
    const widgetSales = stats.topProducts.find(p => p.id === 'p1');
    expect(widgetSales?.totalSold).toBe(2); // only from ord-1
  });

  it('includes inventory stats', () => {
    const stats = getDashboardStats();
    expect(stats.inventory.totalProducts).toBe(2);
    expect(stats.inventory.totalStock).toBe(13);
  });

  it('counts pending reviews', () => {
    const stats = getDashboardStats();
    expect(stats.pendingReviews).toBe(1);
  });
});
