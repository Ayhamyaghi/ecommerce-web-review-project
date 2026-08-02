import { loadDb, saveDb, type DbInventoryLog } from '../db/store';
import { appendInventoryLog, findProductById } from '../db/query-helpers';
import { NotFoundError, ValidationError } from '../errors';

export interface InventoryInfo {
  product: {
    id: string;
    name: string;
    stock: number;
    lowStockThreshold: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
  };
  logs: DbInventoryLog[];
}

export interface InventoryStats {
  totalProducts: number;
  totalStock: number;
  outOfStock: number;
  lowStock: number;
  inStock: number;
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

/** Build the InventoryInfo response shape for a product that is known to exist. */
function buildInventoryInfo(db: ReturnType<typeof loadDb>, productId: string): InventoryInfo {
  const p = findProductById(db, productId)!;
  return {
    product: {
      id: p.id,
      name: p.name,
      stock: p.stock,
      lowStockThreshold: p.lowStockThreshold,
      isLowStock: p.stock > 0 && p.stock <= p.lowStockThreshold,
      isOutOfStock: p.stock <= 0,
    },
    logs: db.inventoryLogs
      .filter(l => l.productId === productId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  };
}

// ---------------------------------------------------------------------------
// Public service functions
// ---------------------------------------------------------------------------

export function getInventory(productId: string): InventoryInfo {
  const db = loadDb();
  if (!findProductById(db, productId)) throw new NotFoundError('Product', productId);
  return buildInventoryInfo(db, productId);
}

export function adjustStock(
  productId: string,
  newStock: number,
  reason: 'manual_adjustment' | 'restock' = 'manual_adjustment',
  referenceId?: string,
): InventoryInfo {
  const db = loadDb();
  const p = findProductById(db, productId);
  if (!p) throw new NotFoundError('Product', productId);
  if (newStock < 0) throw new ValidationError('Stock cannot be negative');
  const prev = p.stock;
  p.stock = newStock;
  p.updatedAt = new Date().toISOString();
  appendInventoryLog(db, productId, prev, newStock, reason, referenceId ?? null);
  saveDb(db);
  return buildInventoryInfo(db, productId);
}

export function getInventoryStats(): InventoryStats {
  const active = loadDb().products.filter(p => p.status === 'active');
  return {
    totalProducts: active.length,
    totalStock: active.reduce((s, p) => s + p.stock, 0),
    outOfStock: active.filter(p => p.stock === 0).length,
    lowStock: active.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold).length,
    inStock: active.filter(p => p.stock > p.lowStockThreshold).length,
  };
}
