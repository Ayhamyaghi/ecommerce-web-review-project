import { loadDb, saveDb, generateId, type DbOrder, type DbOrderItem } from '../db/store';
import { NotFoundError, StockLimitError, PaymentError, ValidationError } from '../errors';
import type { CheckoutInput } from '../schemas/order';
import { getCart, clearCart } from './cart-service';
import { validatePromotionCode } from './promotion-service';

const SHIPPING_COST = 599;
const FREE_SHIPPING_THRESHOLD = 5000;

export interface OrderResult { order: DbOrder; items: DbOrderItem[]; }

export function checkout(sessionId: string, userId: string | null, input: CheckoutInput): OrderResult {
  const db = loadDb();
  const cart = getCart(sessionId);
  if (cart.items.length === 0) throw new ValidationError('Cart is empty');

  for (const item of cart.items) {
    const p = db.products.find(pr => pr.id === item.productId);
    if (!p) throw new NotFoundError('Product', item.productId);
    if (p.stock < item.quantity) throw new StockLimitError(`Insufficient stock for ${p.name}`, { productId: p.id, available: p.stock, requested: item.quantity });
  }

  let subtotal = 0;
  for (const item of cart.items) { const p = db.products.find(pr => pr.id === item.productId)!; subtotal += p.price * item.quantity; }

  let discount = 0, freeShipping = false, promotionCode: string | null = null;
  if (input.promotionCode) {
    const r = validatePromotionCode(input.promotionCode, subtotal);
    if (r.valid && r.promotion) {
      promotionCode = r.promotion.code;
      if (r.promotion.type === 'percentage') { discount = Math.round(subtotal * (r.promotion.value / 100)); if (r.promotion.maxDiscount) discount = Math.min(discount, r.promotion.maxDiscount); }
      else if (r.promotion.type === 'fixed') discount = r.promotion.value;
      else if (r.promotion.type === 'free_shipping') freeShipping = true;
    }
  }

  const afterDiscount = subtotal - discount;
  const shipping = freeShipping || afterDiscount >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const total = afterDiscount + shipping;
  if (total <= 0) throw new PaymentError('Invalid order total');

  const now = new Date().toISOString();
  const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2,5).toUpperCase()}`;

  for (const item of cart.items) {
    const p = db.products.find(pr => pr.id === item.productId)!;
    const prev = p.stock; p.stock -= item.quantity; p.updatedAt = now;
    db.inventoryLogs.push({ id: generateId(), productId: p.id, previousStock: prev, newStock: p.stock, change: -item.quantity, reason: 'order_placed', referenceId: orderId, createdAt: now });
  }

  if (promotionCode) {
    const promo = db.promotions.find(p => p.code === promotionCode);
    if (promo) { promo.usageCount++; db.promotionUsages.push({ id: generateId(), promotionId: promo.id, orderId, userId, usedAt: now }); }
  }

  const order: DbOrder = { id: orderId, userId, email: input.email, status: 'processing', shippingAddress: input.shippingAddress, phone: input.phone, paymentMethod: input.paymentMethod, paymentStatus: 'paid', subtotal, discount, shipping, total, promotionCode, notes: '', createdAt: now, updatedAt: now };
  db.orders.push(order);

  const orderItems: DbOrderItem[] = cart.items.map(item => { const p = db.products.find(pr => pr.id === item.productId)!; return { id: generateId(), orderId, productId: p.id, productName: p.name, productImage: p.images[0] || '', price: p.price, quantity: item.quantity }; });
  db.orderItems.push(...orderItems);
  saveDb(db);
  clearCart(sessionId);
  return { order, items: orderItems };
}

export function getOrder(orderId: string, userId: string | null): OrderResult {
  const db = loadDb();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) throw new NotFoundError('Order', orderId);
  if (userId && order.userId !== userId) throw new NotFoundError('Order', orderId);
  return { order, items: db.orderItems.filter(oi => oi.orderId === orderId) };
}

export function getOrderForAdmin(orderId: string): OrderResult {
  const db = loadDb();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) throw new NotFoundError('Order', orderId);
  return { order, items: db.orderItems.filter(oi => oi.orderId === orderId) };
}

export function listOrders(userId: string): OrderResult[] {
  const db = loadDb();
  return db.orders.filter(o => o.userId === userId).sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(order => ({ order, items: db.orderItems.filter(oi => oi.orderId === order.id) }));
}

export function listAllOrders(): OrderResult[] {
  const db = loadDb();
  return db.orders.sort((a,b) => b.createdAt.localeCompare(a.createdAt)).map(order => ({ order, items: db.orderItems.filter(oi => oi.orderId === order.id) }));
}

export function updateOrderStatus(orderId: string, status: DbOrder['status']): OrderResult {
  const db = loadDb();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) throw new NotFoundError('Order', orderId);
  const now = new Date().toISOString();
  if (status === 'cancelled' && order.status !== 'cancelled') {
    const items = db.orderItems.filter(oi => oi.orderId === orderId);
    for (const item of items) {
      const p = db.products.find(pr => pr.id === item.productId);
      if (p) { const prev = p.stock; p.stock += item.quantity; p.updatedAt = now; db.inventoryLogs.push({ id: generateId(), productId: p.id, previousStock: prev, newStock: p.stock, change: item.quantity, reason: 'order_cancelled', referenceId: orderId, createdAt: now }); }
    }
    order.paymentStatus = 'refunded';
  }
  order.status = status;
  order.updatedAt = now;
  saveDb(db);
  return { order, items: db.orderItems.filter(oi => oi.orderId === orderId) };
}
