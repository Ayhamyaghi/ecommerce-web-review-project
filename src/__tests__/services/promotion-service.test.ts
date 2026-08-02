import { describe, it, expect, beforeEach } from 'vitest';
import { resetDb, loadDb, saveDb } from '@/lib/db/store';
import {
  validatePromotionCode,
  listPromotions,
  createPromotion,
  updatePromotion,
  deletePromotion,
} from '@/lib/services/promotion-service';
import { NotFoundError, ConflictError } from '@/lib/errors';

function seedPromotions() {
  const db = loadDb();
  db.promotions.push(
    { id: 'promo-1', code: 'SAVE10', type: 'percentage', value: 10, minOrderAmount: 2000, maxDiscount: 5000, usageLimit: null, usageCount: 0, description: '10% off', active: true, startsAt: '2024-01-01T00:00:00Z', expiresAt: '2027-12-31T23:59:59Z', createdAt: '2024-01-01T00:00:00Z' },
    { id: 'promo-2', code: 'WELCOME5', type: 'fixed', value: 500, minOrderAmount: 1500, maxDiscount: null, usageLimit: 100, usageCount: 42, description: '$5 off', active: true, startsAt: '2024-01-01T00:00:00Z', expiresAt: '2027-12-31T23:59:59Z', createdAt: '2024-01-02T00:00:00Z' },
    { id: 'promo-3', code: 'FREESHIP', type: 'free_shipping', value: 0, minOrderAmount: 1000, maxDiscount: null, usageLimit: null, usageCount: 0, description: 'Free shipping', active: true, startsAt: '2024-01-01T00:00:00Z', expiresAt: '2027-12-31T23:59:59Z', createdAt: '2024-01-03T00:00:00Z' },
    { id: 'promo-4', code: 'EXPIRED', type: 'percentage', value: 20, minOrderAmount: 0, maxDiscount: null, usageLimit: null, usageCount: 0, description: 'Expired', active: true, startsAt: '2023-01-01T00:00:00Z', expiresAt: '2023-12-31T23:59:59Z', createdAt: '2023-01-01T00:00:00Z' },
    { id: 'promo-5', code: 'INACTIVE', type: 'percentage', value: 15, minOrderAmount: 0, maxDiscount: null, usageLimit: null, usageCount: 0, description: 'Inactive', active: false, startsAt: '2024-01-01T00:00:00Z', expiresAt: '2027-12-31T23:59:59Z', createdAt: '2024-01-04T00:00:00Z' },
    { id: 'promo-6', code: 'MAXEDOUT', type: 'percentage', value: 10, minOrderAmount: 0, maxDiscount: null, usageLimit: 50, usageCount: 50, description: 'Maxed', active: true, startsAt: '2024-01-01T00:00:00Z', expiresAt: '2027-12-31T23:59:59Z', createdAt: '2024-01-05T00:00:00Z' },
    { id: 'promo-7', code: 'FUTURE', type: 'percentage', value: 10, minOrderAmount: 0, maxDiscount: null, usageLimit: null, usageCount: 0, description: 'Not started', active: true, startsAt: '2099-01-01T00:00:00Z', expiresAt: '2099-12-31T23:59:59Z', createdAt: '2024-01-06T00:00:00Z' },
  );
  saveDb(db);
}

beforeEach(() => {
  resetDb();
  seedPromotions();
});

describe('validatePromotionCode', () => {
  it('validates a valid percentage promotion', () => {
    const result = validatePromotionCode('SAVE10', 5000);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(500); // 10% of 5000
    expect(result.freeShipping).toBe(false);
  });

  it('validates case-insensitively', () => {
    const result = validatePromotionCode('save10', 5000);
    expect(result.valid).toBe(true);
  });

  it('validates a fixed discount promotion', () => {
    const result = validatePromotionCode('WELCOME5', 2000);
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(500);
  });

  it('validates a free shipping promotion', () => {
    const result = validatePromotionCode('FREESHIP', 2000);
    expect(result.valid).toBe(true);
    expect(result.freeShipping).toBe(true);
    expect(result.discount).toBe(0);
  });

  it('rejects unknown promotion code', () => {
    const result = validatePromotionCode('FAKECODE', 5000);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Invalid');
  });

  it('rejects inactive promotion', () => {
    const result = validatePromotionCode('INACTIVE', 5000);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('no longer active');
  });

  it('rejects expired promotion', () => {
    const result = validatePromotionCode('EXPIRED', 5000);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('expired');
  });

  it('rejects promotion that has not started yet', () => {
    const result = validatePromotionCode('FUTURE', 5000);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('not started');
  });

  it('rejects promotion at usage limit', () => {
    const result = validatePromotionCode('MAXEDOUT', 5000);
    expect(result.valid).toBe(false);
    expect(result.message).toContain('usage limit');
  });

  it('rejects when subtotal is below minimum order amount', () => {
    const result = validatePromotionCode('SAVE10', 1000); // min is 2000
    expect(result.valid).toBe(false);
    expect(result.message).toContain('Minimum order');
  });

  it('caps percentage discount at maxDiscount', () => {
    const result = validatePromotionCode('SAVE10', 100000); // 10% = 10000, max is 5000
    expect(result.valid).toBe(true);
    expect(result.discount).toBe(5000);
  });

  it('returns promotion object on success', () => {
    const result = validatePromotionCode('SAVE10', 5000);
    expect(result.promotion).toBeDefined();
    expect(result.promotion!.code).toBe('SAVE10');
  });
});

describe('listPromotions', () => {
  it('returns all promotions sorted by newest first', () => {
    const promos = listPromotions();
    expect(promos.length).toBeGreaterThanOrEqual(7);
    // Check sorted by createdAt descending
    for (let i = 1; i < promos.length; i++) {
      expect(promos[i - 1].createdAt >= promos[i].createdAt).toBe(true);
    }
  });
});

describe('createPromotion', () => {
  it('creates a new promotion', () => {
    const promo = createPromotion({
      code: 'NEW20',
      type: 'percentage',
      value: 20,
      minOrderAmount: 1000,
      description: '20% off',
      active: true,
      startsAt: '2024-06-01T00:00:00Z',
      expiresAt: '2025-06-01T00:00:00Z',
    });
    expect(promo.id).toBeTruthy();
    expect(promo.code).toBe('NEW20');
    expect(promo.usageCount).toBe(0);
  });

  it('throws ConflictError for duplicate code', () => {
    expect(() => createPromotion({
      code: 'SAVE10',
      type: 'percentage',
      value: 15,
      minOrderAmount: 0,
      description: 'dup',
      active: true,
      startsAt: '2024-01-01T00:00:00Z',
      expiresAt: '2025-01-01T00:00:00Z',
    })).toThrow(ConflictError);
  });
});

describe('updatePromotion', () => {
  it('updates promotion fields', () => {
    const result = updatePromotion('promo-1', { value: 15 });
    expect(result.value).toBe(15);
    expect(result.code).toBe('SAVE10');
  });

  it('throws NotFoundError for non-existent id', () => {
    expect(() => updatePromotion('nonexistent', { value: 10 })).toThrow(NotFoundError);
  });

  it('throws ConflictError when updating code to existing code', () => {
    expect(() => updatePromotion('promo-1', { code: 'WELCOME5' })).toThrow(ConflictError);
  });

  it('allows updating code to the same value', () => {
    const result = updatePromotion('promo-1', { code: 'SAVE10' });
    expect(result.code).toBe('SAVE10');
  });
});

describe('deletePromotion', () => {
  it('removes the promotion', () => {
    deletePromotion('promo-1');
    const db = loadDb();
    expect(db.promotions.find(p => p.id === 'promo-1')).toBeUndefined();
  });

  it('throws NotFoundError for non-existent id', () => {
    expect(() => deletePromotion('nonexistent')).toThrow(NotFoundError);
  });
});
