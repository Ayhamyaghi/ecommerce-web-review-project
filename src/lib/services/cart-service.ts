import { loadDb, saveDb, generateId } from '../db/store';
import { NotFoundError, StockLimitError } from '../errors';

export interface CartWithTotals { items: Array<{ id: string; productId: string; productName: string; productImage: string; productSlug: string; price: number; stock: number; quantity: number; subtotal: number; }>; subtotal: number; itemCount: number; }

export function getCart(sessionId: string): CartWithTotals {
  const db = loadDb();
  const items = db.cartItems.filter(ci => ci.sessionId === sessionId).map(ci => {
    const p = db.products.find(pr => pr.id === ci.productId);
    if (!p || p.status !== 'active') return null;
    const qty = Math.min(ci.quantity, p.stock);
    return { id: ci.id, productId: p.id, productName: p.name, productImage: p.images[0] || '', productSlug: p.slug, price: p.price, stock: p.stock, quantity: qty, subtotal: p.price * qty };
  }).filter((i): i is NonNullable<typeof i> => i !== null && i.quantity > 0);
  return { items, subtotal: items.reduce((s,i) => s + i.subtotal, 0), itemCount: items.reduce((s,i) => s + i.quantity, 0) };
}

export function addToCart(sessionId: string, productId: string, quantity: number): CartWithTotals {
  const db = loadDb();
  const p = db.products.find(pr => pr.id === productId && pr.status === 'active');
  if (!p) throw new NotFoundError('Product', productId);
  if (p.stock <= 0) throw new StockLimitError('Product is out of stock', { productId });
  const existing = db.cartItems.find(ci => ci.sessionId === sessionId && ci.productId === productId);
  if (existing) {
    const newQty = existing.quantity + quantity;
    if (newQty > p.stock) throw new StockLimitError(`Only ${p.stock} available (${existing.quantity} in cart)`, { productId, available: p.stock });
    existing.quantity = newQty;
  } else {
    if (quantity > p.stock) throw new StockLimitError(`Only ${p.stock} available`, { productId, available: p.stock });
    db.cartItems.push({ id: generateId(), sessionId, productId, quantity, addedAt: new Date().toISOString() });
  }
  saveDb(db);
  return getCart(sessionId);
}

export function updateCartItem(sessionId: string, productId: string, quantity: number): CartWithTotals {
  const db = loadDb();
  if (quantity === 0) return removeCartItem(sessionId, productId);
  const p = db.products.find(pr => pr.id === productId);
  if (!p) throw new NotFoundError('Product', productId);
  if (quantity > p.stock) throw new StockLimitError(`Only ${p.stock} available`, { productId, available: p.stock });
  const item = db.cartItems.find(ci => ci.sessionId === sessionId && ci.productId === productId);
  if (!item) throw new NotFoundError('Cart item');
  item.quantity = quantity;
  saveDb(db);
  return getCart(sessionId);
}

export function removeCartItem(sessionId: string, productId: string): CartWithTotals {
  const db = loadDb();
  db.cartItems = db.cartItems.filter(ci => !(ci.sessionId === sessionId && ci.productId === productId));
  saveDb(db);
  return getCart(sessionId);
}

export function clearCart(sessionId: string): void {
  const db = loadDb();
  db.cartItems = db.cartItems.filter(ci => ci.sessionId !== sessionId);
  saveDb(db);
}

export function mergeGuestCart(guestSessionId: string, userSessionId: string): void {
  const db = loadDb();
  const guestItems = db.cartItems.filter(ci => ci.sessionId === guestSessionId);
  for (const gi of guestItems) {
    const existing = db.cartItems.find(ci => ci.sessionId === userSessionId && ci.productId === gi.productId);
    if (existing) { const p = db.products.find(pr => pr.id === gi.productId); existing.quantity = Math.min(existing.quantity + gi.quantity, p?.stock ?? existing.quantity); }
    else gi.sessionId = userSessionId;
  }
  db.cartItems = db.cartItems.filter(ci => ci.sessionId !== guestSessionId);
  saveDb(db);
}
