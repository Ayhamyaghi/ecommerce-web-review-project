import { loadDb, saveDb, generateId } from '../db/store';
import { NotFoundError } from '../errors';

export interface WishlistItemWithProduct { id: string; productId: string; productName: string; productSlug: string; productImage: string; productPrice: number; productStock: number; addedAt: string; }

export function getWishlist(userId: string): WishlistItemWithProduct[] {
  const db = loadDb();
  return db.wishlistItems.filter(w => w.userId === userId).map(w => {
    const p = db.products.find(pr => pr.id === w.productId);
    if (!p || p.status !== 'active') return null;
    return { id: w.id, productId: p.id, productName: p.name, productSlug: p.slug, productImage: p.images[0] || '', productPrice: p.price, productStock: p.stock, addedAt: w.addedAt };
  }).filter((i): i is NonNullable<typeof i> => i !== null).sort((a,b) => b.addedAt.localeCompare(a.addedAt));
}

export function addToWishlist(userId: string, productId: string): WishlistItemWithProduct[] {
  const db = loadDb();
  if (!db.products.find(p => p.id === productId && p.status === 'active')) throw new NotFoundError('Product', productId);
  if (db.wishlistItems.find(w => w.userId === userId && w.productId === productId)) return getWishlist(userId);
  db.wishlistItems.push({ id: generateId(), userId, productId, addedAt: new Date().toISOString() });
  saveDb(db);
  return getWishlist(userId);
}

export function removeFromWishlist(userId: string, productId: string): WishlistItemWithProduct[] {
  const db = loadDb();
  db.wishlistItems = db.wishlistItems.filter(w => !(w.userId === userId && w.productId === productId));
  saveDb(db);
  return getWishlist(userId);
}
