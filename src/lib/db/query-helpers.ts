/**
 * Reusable database query helpers.
 *
 * These functions encapsulate common data-access patterns used across multiple
 * services so each service does not need to re-implement the same logic.
 */
import { generateId, type DbSchema, type DbProduct, type DbInventoryLog } from './store';

// ---------------------------------------------------------------------------
// Product lookups
// ---------------------------------------------------------------------------

/** Find a product by ID. Returns undefined when not found. */
export function findProductById(db: DbSchema, id: string): DbProduct | undefined {
  return db.products.find((p) => p.id === id);
}

/** Find an active product by ID. Returns undefined when not found or not active. */
export function findActiveProductById(db: DbSchema, id: string): DbProduct | undefined {
  return db.products.find((p) => p.id === id && p.status === 'active');
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Slice an already-sorted array into a single page and return the metadata.
 * This removes duplicated paging arithmetic from every list function.
 */
export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PageResult<T> {
  const total = items.length;
  const totalPages = pageSize > 0 ? Math.ceil(total / pageSize) : 0;
  const start = (page - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
}

// ---------------------------------------------------------------------------
// Inventory log creation
// ---------------------------------------------------------------------------

export type InventoryReason = DbInventoryLog['reason'];

/**
 * Append an inventory log entry to the database and return the new log record.
 *
 * Centralising log creation avoids the inline object literals that were
 * scattered across product-service, inventory-service, and order-service.
 */
export function appendInventoryLog(
  db: DbSchema,
  productId: string,
  previousStock: number,
  newStock: number,
  reason: InventoryReason,
  referenceId: string | null = null,
  timestamp?: string,
): DbInventoryLog {
  const createdAt = timestamp ?? new Date().toISOString();
  const log: DbInventoryLog = {
    id: generateId(),
    productId,
    previousStock,
    newStock,
    change: newStock - previousStock,
    reason,
    referenceId,
    createdAt,
  };
  db.inventoryLogs.push(log);
  return log;
}

// ---------------------------------------------------------------------------
// Order helpers
// ---------------------------------------------------------------------------

/**
 * Generate a human-readable order ID in the format
 * `ORD-<base36 timestamp>-<random suffix>`.
 *
 * This was previously inlined inside `checkout()` in order-service.
 */
export function generateOrderId(): string {
  return `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
}
