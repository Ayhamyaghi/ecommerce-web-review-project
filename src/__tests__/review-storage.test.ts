import { describe, it, expect, beforeEach } from 'vitest';
import { loadReviews, saveReviews, validateStoredReviews } from '../lib/review-storage';
import type { Review } from '../lib/types';

const validReview: Review = {
  id: 'r1',
  productId: 'p1',
  authorName: 'Alice',
  authorEmail: 'alice@example.com',
  rating: 5,
  title: 'Excellent',
  body: 'Absolutely love this product',
  createdAt: '2026-01-01T00:00:00Z',
  helpfulVotes: 2,
};

beforeEach(() => {
  localStorage.clear();
});

describe('saveReviews and loadReviews', () => {
  it('round-trips reviews through localStorage', () => {
    saveReviews([validReview]);
    const loaded = loadReviews();
    expect(loaded).toEqual([validReview]);
  });

  it('returns empty array when nothing is stored', () => {
    expect(loadReviews()).toEqual([]);
  });

  it('returns empty array for corrupted JSON', () => {
    localStorage.setItem('ecommerce-reviews', '{invalid json');
    expect(loadReviews()).toEqual([]);
  });

  it('returns empty array for non-array stored data', () => {
    localStorage.setItem('ecommerce-reviews', JSON.stringify({ not: 'an array' }));
    expect(loadReviews()).toEqual([]);
  });

  it('filters out invalid entries from stored data', () => {
    const data = [validReview, { id: 'bad', missing: 'fields' }];
    localStorage.setItem('ecommerce-reviews', JSON.stringify(data));
    const loaded = loadReviews();
    expect(loaded).toEqual([validReview]);
  });
});

describe('validateStoredReviews', () => {
  it('returns null for non-array input', () => {
    expect(validateStoredReviews('string')).toBeNull();
    expect(validateStoredReviews(null)).toBeNull();
    expect(validateStoredReviews(42)).toBeNull();
  });

  it('accepts empty array', () => {
    expect(validateStoredReviews([])).toEqual([]);
  });

  it('rejects reviews with invalid rating', () => {
    const bad = { ...validReview, rating: 6 };
    expect(validateStoredReviews([bad])).toBeNull();
  });

  it('rejects reviews with missing fields', () => {
    const incomplete = { ...validReview } as Record<string, unknown>;
    delete incomplete.title;
    expect(validateStoredReviews([incomplete])).toBeNull();
  });
});
