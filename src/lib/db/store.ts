import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface DbUser { id: string; email: string; name: string; passwordHash: string; role: 'USER' | 'ADMIN'; createdAt: string; }
export interface DbSession { token: string; userId: string; expiresAt: string; }
export interface DbProduct { id: string; name: string; slug: string; description: string; price: number; compareAtPrice: number | null; category: string; images: string[]; specifications: Record<string, string>; tags: string[]; featured: boolean; status: 'active' | 'draft' | 'archived'; stock: number; lowStockThreshold: number; createdAt: string; updatedAt: string; }
export interface DbCategory { id: string; name: string; slug: string; description: string; image: string; }
export interface DbCartItem { id: string; sessionId: string; productId: string; quantity: number; addedAt: string; }
export interface DbWishlistItem { id: string; userId: string; productId: string; addedAt: string; }
export interface DbOrder { id: string; userId: string | null; email: string; status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'; shippingAddress: { firstName: string; lastName: string; address: string; city: string; state: string; postalCode: string; country: string; }; phone: string; paymentMethod: string; paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded'; subtotal: number; discount: number; shipping: number; total: number; promotionCode: string | null; notes: string; createdAt: string; updatedAt: string; }
export interface DbOrderItem { id: string; orderId: string; productId: string; productName: string; productImage: string; price: number; quantity: number; }
export interface DbReview { id: string; productId: string; userId: string; authorName: string; rating: number; title: string; body: string; verified: boolean; status: 'pending' | 'approved' | 'rejected'; helpfulVotes: number; createdAt: string; updatedAt: string; }
export interface DbPromotion { id: string; code: string; type: 'percentage' | 'fixed' | 'free_shipping'; value: number; minOrderAmount: number; maxDiscount: number | null; usageLimit: number | null; usageCount: number; description: string; active: boolean; startsAt: string; expiresAt: string; createdAt: string; }
export interface DbPromotionUsage { id: string; promotionId: string; orderId: string; userId: string | null; usedAt: string; }
export interface DbInventoryLog { id: string; productId: string; previousStock: number; newStock: number; change: number; reason: 'manual_adjustment' | 'order_placed' | 'order_cancelled' | 'restock' | 'initial'; referenceId: string | null; createdAt: string; }

export interface DbSchema {
  users: DbUser[]; sessions: DbSession[]; products: DbProduct[]; categories: DbCategory[];
  cartItems: DbCartItem[]; wishlistItems: DbWishlistItem[]; orders: DbOrder[]; orderItems: DbOrderItem[];
  reviews: DbReview[]; promotions: DbPromotion[]; promotionUsages: DbPromotionUsage[]; inventoryLogs: DbInventoryLog[];
}

const EMPTY_DB: DbSchema = { users: [], sessions: [], products: [], categories: [], cartItems: [], wishlistItems: [], orders: [], orderItems: [], reviews: [], promotions: [], promotionUsages: [], inventoryLogs: [] };

let memoryDb: DbSchema | null = null;

function ensureDir(): void { try { if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true }); } catch { /* ignore */ } }

export function loadDb(): DbSchema {
  if (memoryDb) return memoryDb;
  ensureDir();
  try { if (existsSync(DB_FILE)) { memoryDb = JSON.parse(readFileSync(DB_FILE, 'utf-8')) as DbSchema; return memoryDb; } } catch { /* corrupted */ }
  memoryDb = structuredClone(EMPTY_DB);
  return memoryDb;
}

export function saveDb(db: DbSchema): void {
  memoryDb = db;
  ensureDir();
  try { writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8'); } catch { /* ignore */ }
}

export function resetDb(): void { memoryDb = structuredClone(EMPTY_DB); ensureDir(); try { writeFileSync(DB_FILE, JSON.stringify(memoryDb, null, 2), 'utf-8'); } catch { /* ignore */ } }

export function generateId(): string { return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`; }
