import { loadDb, saveDb, generateId, type DbPromotion } from '../db/store';
import { NotFoundError, ConflictError } from '../errors';
import type { CreatePromotionInput } from '../schemas/promotion';

export interface PromotionValidationResult { valid: boolean; message: string; promotion?: DbPromotion; discount?: number; freeShipping?: boolean; }

export function validatePromotionCode(code: string, subtotal: number): PromotionValidationResult {
  const db = loadDb();
  const promo = db.promotions.find(p => p.code.toUpperCase() === code.toUpperCase());
  if (!promo) return { valid: false, message: 'Invalid promotion code' };
  if (!promo.active) return { valid: false, message: 'This promotion is no longer active' };
  const now = new Date();
  if (new Date(promo.startsAt) > now) return { valid: false, message: 'This promotion has not started yet' };
  if (new Date(promo.expiresAt) < now) return { valid: false, message: 'This promotion has expired' };
  if (promo.usageLimit && promo.usageCount >= promo.usageLimit) return { valid: false, message: 'This promotion has reached its usage limit' };
  if (subtotal < promo.minOrderAmount) return { valid: false, message: `Minimum order of $${(promo.minOrderAmount/100).toFixed(2)} required` };
  let discount = 0, freeShipping = false;
  if (promo.type === 'percentage') { discount = Math.round(subtotal * (promo.value / 100)); if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount); }
  else if (promo.type === 'fixed') discount = promo.value;
  else if (promo.type === 'free_shipping') freeShipping = true;
  return { valid: true, message: promo.description, promotion: promo, discount, freeShipping };
}

export function listPromotions(): DbPromotion[] { return loadDb().promotions.sort((a,b) => b.createdAt.localeCompare(a.createdAt)); }

export function createPromotion(input: CreatePromotionInput): DbPromotion {
  const db = loadDb();
  if (db.promotions.some(p => p.code === input.code)) throw new ConflictError(`Code '${input.code}' already exists`);
  const promo: DbPromotion = { id: generateId(), code: input.code, type: input.type, value: input.value, minOrderAmount: input.minOrderAmount, maxDiscount: input.maxDiscount ?? null, usageLimit: input.usageLimit ?? null, usageCount: 0, description: input.description, active: input.active, startsAt: input.startsAt, expiresAt: input.expiresAt, createdAt: new Date().toISOString() };
  db.promotions.push(promo);
  saveDb(db);
  return promo;
}

export function updatePromotion(id: string, input: Partial<CreatePromotionInput>): DbPromotion {
  const db = loadDb();
  const idx = db.promotions.findIndex(p => p.id === id);
  if (idx === -1) throw new NotFoundError('Promotion', id);
  if (input.code && input.code !== db.promotions[idx].code && db.promotions.some(p => p.code === input.code && p.id !== id)) throw new ConflictError(`Code '${input.code}' already exists`);
  db.promotions[idx] = { ...db.promotions[idx], ...input };
  saveDb(db);
  return db.promotions[idx];
}

export function deletePromotion(id: string): void {
  const db = loadDb();
  const idx = db.promotions.findIndex(p => p.id === id);
  if (idx === -1) throw new NotFoundError('Promotion', id);
  db.promotions.splice(idx, 1);
  saveDb(db);
}
