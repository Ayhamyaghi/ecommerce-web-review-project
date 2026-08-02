import { loadDb, saveDb, generateId, type DbOrder, type DbOrderItem } from '../db/store';
import { appendInventoryLog, generateOrderId, findProductById } from '../db/query-helpers';
import { NotFoundError, StockLimitError, PaymentError, ValidationError } from '../errors';
import type { CheckoutInput } from '../schemas/order';
import { getCart, clearCart } from './cart-service';
import { validatePromotionCode } from './promotion-service';
import { computePromotionPricing, calculateShippingCost } from './pricing-helpers';

export interface OrderResult { order: DbOrder; items: DbOrderItem[]; }

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/** Verify that every cart item has sufficient stock, throwing on first failure. */
function assertSufficientStock(db: ReturnType<typeof loadDb>, cartItems: ReturnType<typeof getCart>['items']): void {
  for (const item of cartItems) {
    const p = findProductById(db, item.productId);
    if (!p) throw new NotFoundError('Product', item.productId);
    if (p.stock < item.quantity) {
      throw new StockLimitError(`Insufficient stock for ${p.name}`, {
        productId: p.id,
        available: p.stock,
        requested: item.quantity,
      });
    }
  }
}

/** Sum the subtotal for all cart items using current product prices. */
function computeCartSubtotal(db: ReturnType<typeof loadDb>, cartItems: ReturnType<typeof getCart>['items']): number {
  return cartItems.reduce((sum, item) => {
    const p = findProductById(db, item.productId)!;
    return sum + p.price * item.quantity;
  }, 0);
}

/** Deduct ordered quantities from stock and write inventory log entries. */
function deductStockForOrder(
  db: ReturnType<typeof loadDb>,
  cartItems: ReturnType<typeof getCart>['items'],
  orderId: string,
  timestamp: string,
): void {
  for (const item of cartItems) {
    const p = findProductById(db, item.productId)!;
    const prev = p.stock;
    p.stock -= item.quantity;
    p.updatedAt = timestamp;
    appendInventoryLog(db, p.id, prev, p.stock, 'order_placed', orderId, timestamp);
  }
}

/** Record promotion usage when a code was applied. */
function recordPromotionUsage(
  db: ReturnType<typeof loadDb>,
  promotionCode: string,
  orderId: string,
  userId: string | null,
  timestamp: string,
): void {
  const promo = db.promotions.find(p => p.code === promotionCode);
  if (promo) {
    promo.usageCount++;
    db.promotionUsages.push({ id: generateId(), promotionId: promo.id, orderId, userId, usedAt: timestamp });
  }
}

/** Build the list of DbOrderItem records from cart items and current product data. */
function buildOrderItems(
  db: ReturnType<typeof loadDb>,
  cartItems: ReturnType<typeof getCart>['items'],
  orderId: string,
): DbOrderItem[] {
  return cartItems.map(item => {
    const p = findProductById(db, item.productId)!;
    return {
      id: generateId(),
      orderId,
      productId: p.id,
      productName: p.name,
      productImage: p.images[0] || '',
      price: p.price,
      quantity: item.quantity,
    };
  });
}

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

export function checkout(sessionId: string, userId: string | null, input: CheckoutInput): OrderResult {
  const db = loadDb();
  const cart = getCart(sessionId);
  if (cart.items.length === 0) throw new ValidationError('Cart is empty');

  assertSufficientStock(db, cart.items);

  const subtotal = computeCartSubtotal(db, cart.items);

  let discount = 0;
  let freeShipping = false;
  let promotionCode: string | null = null;

  if (input.promotionCode) {
    const r = validatePromotionCode(input.promotionCode, subtotal);
    if (r.valid && r.promotion) {
      const pricing = computePromotionPricing(r.promotion, subtotal);
      discount = pricing.discount;
      freeShipping = pricing.freeShipping;
      promotionCode = pricing.promotionCode;
    }
  }

  const afterDiscount = subtotal - discount;
  const shipping = calculateShippingCost(afterDiscount, freeShipping);
  const total = afterDiscount + shipping;
  if (total <= 0) throw new PaymentError('Invalid order total');

  const now = new Date().toISOString();
  const orderId = generateOrderId();

  deductStockForOrder(db, cart.items, orderId, now);

  if (promotionCode) {
    recordPromotionUsage(db, promotionCode, orderId, userId, now);
  }

  const order: DbOrder = {
    id: orderId,
    userId,
    email: input.email,
    status: 'processing',
    shippingAddress: input.shippingAddress,
    phone: input.phone,
    paymentMethod: input.paymentMethod,
    paymentStatus: 'paid',
    subtotal,
    discount,
    shipping,
    total,
    promotionCode,
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
  db.orders.push(order);

  const orderItems = buildOrderItems(db, cart.items, orderId);
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
  return db.orders
    .filter(o => o.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(order => ({ order, items: db.orderItems.filter(oi => oi.orderId === order.id) }));
}

export function listAllOrders(): OrderResult[] {
  const db = loadDb();
  return db.orders
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .map(order => ({ order, items: db.orderItems.filter(oi => oi.orderId === order.id) }));
}

export function updateOrderStatus(orderId: string, status: DbOrder['status']): OrderResult {
  const db = loadDb();
  const order = db.orders.find(o => o.id === orderId);
  if (!order) throw new NotFoundError('Order', orderId);
  const now = new Date().toISOString();
  if (status === 'cancelled' && order.status !== 'cancelled') {
    const items = db.orderItems.filter(oi => oi.orderId === orderId);
    for (const item of items) {
      const p = findProductById(db, item.productId);
      if (p) {
        const prev = p.stock;
        p.stock += item.quantity;
        p.updatedAt = now;
        appendInventoryLog(db, p.id, prev, p.stock, 'order_cancelled', orderId, now);
      }
    }
    order.paymentStatus = 'refunded';
  }
  order.status = status;
  order.updatedAt = now;
  saveDb(db);
  return { order, items: db.orderItems.filter(oi => oi.orderId === orderId) };
}
