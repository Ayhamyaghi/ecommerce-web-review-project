import { loadDb, saveDb, generateId, type DbProduct } from '../db/store';
import { NotFoundError, ConflictError } from '../errors';
import type { ProductQuery, CreateProductInput, UpdateProductInput } from '../schemas/product';

export interface ProductListResult { products: DbProduct[]; total: number; page: number; pageSize: number; totalPages: number; categories: string[]; }

export function listProducts(query: ProductQuery): ProductListResult {
  const db = loadDb();
  let results = db.products.filter(p => { if (query.status && p.status !== query.status) return false; if (!query.status && p.status !== 'active') return false; return true; });
  if (query.featured !== undefined) results = results.filter(p => p.featured === query.featured);
  if (query.search) { const lower = query.search.toLowerCase(); results = results.filter(p => p.name.toLowerCase().includes(lower) || p.description.toLowerCase().includes(lower) || p.tags.some(t => t.toLowerCase().includes(lower))); }
  if (query.category) results = results.filter(p => p.category === query.category);
  if (query.minPrice !== undefined) results = results.filter(p => p.price >= query.minPrice!);
  if (query.maxPrice !== undefined) results = results.filter(p => p.price <= query.maxPrice!);
  switch (query.sort) {
    case 'price-asc': results.sort((a,b) => a.price - b.price); break;
    case 'price-desc': results.sort((a,b) => b.price - a.price); break;
    case 'name-asc': results.sort((a,b) => a.name.localeCompare(b.name)); break;
    case 'name-desc': results.sort((a,b) => b.name.localeCompare(a.name)); break;
    case 'newest': results.sort((a,b) => b.createdAt.localeCompare(a.createdAt)); break;
    default: results.sort((a,b) => { if (a.featured !== b.featured) return a.featured ? -1 : 1; return a.name.localeCompare(b.name); });
  }
  const total = results.length;
  const totalPages = Math.ceil(total / query.pageSize);
  const start = (query.page - 1) * query.pageSize;
  const categories = [...new Set(db.products.filter(p => p.status === 'active').map(p => p.category))];
  return { products: results.slice(start, start + query.pageSize), total, page: query.page, pageSize: query.pageSize, totalPages, categories };
}

export function getProduct(idOrSlug: string): DbProduct {
  const db = loadDb();
  const p = db.products.find(p => p.id === idOrSlug || p.slug === idOrSlug);
  if (!p) throw new NotFoundError('Product', idOrSlug);
  return p;
}

export function getRelatedProducts(productId: string, limit = 4): DbProduct[] {
  const db = loadDb();
  const p = db.products.find(p => p.id === productId);
  if (!p) return [];
  return db.products.filter(r => r.id !== productId && r.category === p.category && r.status === 'active').slice(0, limit);
}

export function getFeaturedProducts(limit = 8): DbProduct[] {
  const db = loadDb();
  return db.products.filter(p => p.featured && p.status === 'active').slice(0, limit);
}

export function createProduct(input: CreateProductInput): DbProduct {
  const db = loadDb();
  if (db.products.some(p => p.slug === input.slug)) throw new ConflictError(`Slug '${input.slug}' already exists`);
  const now = new Date().toISOString();
  const product: DbProduct = { id: generateId(), name: input.name, slug: input.slug, description: input.description, price: input.price, compareAtPrice: input.compareAtPrice ?? null, category: input.category, images: input.images, specifications: input.specifications ?? {}, tags: input.tags ?? [], featured: input.featured ?? false, status: input.status ?? 'active', stock: input.stock ?? 0, lowStockThreshold: input.lowStockThreshold ?? 5, createdAt: now, updatedAt: now };
  db.products.push(product);
  db.inventoryLogs.push({ id: generateId(), productId: product.id, previousStock: 0, newStock: product.stock, change: product.stock, reason: 'initial', referenceId: null, createdAt: now });
  saveDb(db);
  return product;
}

export function updateProduct(id: string, input: UpdateProductInput): DbProduct {
  const db = loadDb();
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) throw new NotFoundError('Product', id);
  if (input.slug && input.slug !== db.products[idx].slug && db.products.some(p => p.slug === input.slug && p.id !== id)) throw new ConflictError(`Slug '${input.slug}' already exists`);
  const prev = db.products[idx];
  db.products[idx] = { ...prev, ...input, updatedAt: new Date().toISOString() };
  if (input.stock !== undefined && input.stock !== prev.stock) {
    db.inventoryLogs.push({ id: generateId(), productId: id, previousStock: prev.stock, newStock: input.stock, change: input.stock - prev.stock, reason: 'manual_adjustment', referenceId: null, createdAt: new Date().toISOString() });
  }
  saveDb(db);
  return db.products[idx];
}

export function deleteProduct(id: string): void {
  const db = loadDb();
  const idx = db.products.findIndex(p => p.id === id);
  if (idx === -1) throw new NotFoundError('Product', id);
  db.products[idx].status = 'archived';
  db.products[idx].updatedAt = new Date().toISOString();
  saveDb(db);
}

export function getCategories() { return loadDb().categories; }
