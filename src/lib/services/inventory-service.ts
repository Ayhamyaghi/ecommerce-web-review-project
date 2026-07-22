import { loadDb, saveDb, generateId, type DbInventoryLog } from '../db/store';
import { NotFoundError, ValidationError } from '../errors';

export interface InventoryInfo { product: { id: string; name: string; stock: number; lowStockThreshold: number; isLowStock: boolean; isOutOfStock: boolean; }; logs: DbInventoryLog[]; }

export function getInventory(productId: string): InventoryInfo {
  const db = loadDb();
  const p = db.products.find(pr => pr.id === productId);
  if (!p) throw new NotFoundError('Product', productId);
  return { product: { id: p.id, name: p.name, stock: p.stock, lowStockThreshold: p.lowStockThreshold, isLowStock: p.stock > 0 && p.stock <= p.lowStockThreshold, isOutOfStock: p.stock <= 0 }, logs: db.inventoryLogs.filter(l => l.productId === productId).sort((a,b) => b.createdAt.localeCompare(a.createdAt)) };
}

export function adjustStock(productId: string, newStock: number, reason: 'manual_adjustment' | 'restock' = 'manual_adjustment', referenceId?: string): InventoryInfo {
  const db = loadDb();
  const p = db.products.find(pr => pr.id === productId);
  if (!p) throw new NotFoundError('Product', productId);
  if (newStock < 0) throw new ValidationError('Stock cannot be negative');
  const prev = p.stock; p.stock = newStock; p.updatedAt = new Date().toISOString();
  db.inventoryLogs.push({ id: generateId(), productId, previousStock: prev, newStock, change: newStock - prev, reason, referenceId: referenceId ?? null, createdAt: new Date().toISOString() });
  saveDb(db);
  return getInventory(productId);
}

export function getInventoryStats() {
  const active = loadDb().products.filter(p => p.status === 'active');
  return { totalProducts: active.length, totalStock: active.reduce((s,p) => s + p.stock, 0), outOfStock: active.filter(p => p.stock === 0).length, lowStock: active.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length, inStock: active.filter(p => p.stock > p.lowStockThreshold).length };
}
