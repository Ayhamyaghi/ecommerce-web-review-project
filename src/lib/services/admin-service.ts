import { loadDb } from '../db/store';
import { getInventoryStats } from './inventory-service';

export function getDashboardStats() {
  const db = loadDb();
  const totalRevenue = db.orders.filter(o => o.paymentStatus === 'paid').reduce((s,o) => s + o.total, 0);
  const productSales: Record<string, { name: string; totalSold: number; revenue: number }> = {};
  for (const oi of db.orderItems) { const o = db.orders.find(or => or.id === oi.orderId); if (!o || o.status === 'cancelled') continue; if (!productSales[oi.productId]) productSales[oi.productId] = { name: oi.productName, totalSold: 0, revenue: 0 }; productSales[oi.productId].totalSold += oi.quantity; productSales[oi.productId].revenue += oi.price * oi.quantity; }
  return {
    totalOrders: db.orders.length, totalRevenue,
    totalCustomers: new Set(db.users.filter(u => u.role === 'USER').map(u => u.id)).size,
    totalProducts: db.products.filter(p => p.status === 'active').length,
    pendingOrders: db.orders.filter(o => o.status === 'pending' || o.status === 'processing').length,
    recentOrders: db.orders.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 10).map(o => ({ id: o.id, email: o.email, total: o.total, status: o.status, createdAt: o.createdAt })),
    topProducts: Object.entries(productSales).map(([id,d]) => ({ id, ...d })).sort((a,b) => b.totalSold - a.totalSold).slice(0, 5),
    inventory: getInventoryStats(),
    pendingReviews: db.reviews.filter(r => r.status === 'pending').length,
  };
}
