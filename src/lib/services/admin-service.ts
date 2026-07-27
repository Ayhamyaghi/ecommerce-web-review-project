import { loadDb, type DbSchema } from '../db/store';
import { getInventoryStats } from './inventory-service';

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/**
 * Aggregate per-product sales data from order items, excluding cancelled
 * orders. This was previously an inline loop inside `getDashboardStats`.
 */
function computeProductSales(
  db: DbSchema,
): Record<string, { name: string; totalSold: number; revenue: number }> {
  const productSales: Record<string, { name: string; totalSold: number; revenue: number }> = {};
  for (const oi of db.orderItems) {
    const order = db.orders.find(o => o.id === oi.orderId);
    if (!order || order.status === 'cancelled') continue;
    if (!productSales[oi.productId]) {
      productSales[oi.productId] = { name: oi.productName, totalSold: 0, revenue: 0 };
    }
    productSales[oi.productId].totalSold += oi.quantity;
    productSales[oi.productId].revenue += oi.price * oi.quantity;
  }
  return productSales;
}

/**
 * Derive the top-selling products from the aggregated sales map, sorted by
 * units sold descending.
 */
function getTopProducts(
  productSales: Record<string, { name: string; totalSold: number; revenue: number }>,
  limit = 5,
) {
  return Object.entries(productSales)
    .map(([id, d]) => ({ id, ...d }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
}

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

export function getDashboardStats() {
  const db = loadDb();
  const totalRevenue = db.orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((s, o) => s + o.total, 0);

  const productSales = computeProductSales(db);

  return {
    totalOrders: db.orders.length,
    totalRevenue,
    totalCustomers: new Set(db.users.filter(u => u.role === 'USER').map(u => u.id)).size,
    totalProducts: db.products.filter(p => p.status === 'active').length,
    pendingOrders: db.orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
    recentOrders: db.orders
      .slice()
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 10)
      .map(o => ({ id: o.id, email: o.email, total: o.total, status: o.status, createdAt: o.createdAt })),
    topProducts: getTopProducts(productSales),
    inventory: getInventoryStats(),
    pendingReviews: db.reviews.filter(r => r.status === 'pending').length,
  };
}
