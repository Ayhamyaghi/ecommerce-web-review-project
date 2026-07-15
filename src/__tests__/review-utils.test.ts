import { describe, it, expect } from 'vitest';
import {
  calculateReviewStats,
  sortReviews,
  createReview,
  incrementHelpfulVote,
} from '../lib/review-utils';
import type { Review } from '../lib/types';

function makeReview(overrides: Partial<Review> = {}): Review {
  return {
    id: '1',
    productId: 'p1',
    authorName: 'Alice',
    authorEmail: 'alice@example.com',
    rating: 4,
    title: 'Good',
    body: 'This is a solid product',
    createdAt: '2026-01-15T10:00:00Z',
    helpfulVotes: 0,
    ...overrides,
  };
}

describe('calculateReviewStats', () => {
  it('returns zeros for empty array', () => {
    const stats = calculateReviewStats([]);
    expect(stats.averageRating).toBe(0);
    expect(stats.totalReviews).toBe(0);
    expect(stats.distribution).toEqual({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  });

  it('calculates stats for a single review', () => {
    const stats = calculateReviewStats([makeReview({ rating: 5 })]);
    expect(stats.averageRating).toBe(5);
    expect(stats.totalReviews).toBe(1);
    expect(stats.distribution[5]).toBe(1);
  });

  it('calculates average and distribution for multiple reviews', () => {
    const reviews = [
      makeReview({ id: '1', rating: 5 }),
      makeReview({ id: '2', rating: 3 }),
      makeReview({ id: '3', rating: 4 }),
    ];
    const stats = calculateReviewStats(reviews);
    expect(stats.averageRating).toBe(4);
    expect(stats.totalReviews).toBe(3);
    expect(stats.distribution[5]).toBe(1);
    expect(stats.distribution[4]).toBe(1);
    expect(stats.distribution[3]).toBe(1);
    expect(stats.distribution[2]).toBe(0);
  });

  it('rounds average to one decimal place', () => {
    const reviews = [
      makeReview({ id: '1', rating: 5 }),
      makeReview({ id: '2', rating: 4 }),
      makeReview({ id: '3', rating: 4 }),
    ];
    const stats = calculateReviewStats(reviews);
    expect(stats.averageRating).toBe(4.3);
  });
});

describe('sortReviews', () => {
  const reviews = [
    makeReview({ id: '1', createdAt: '2026-01-10T00:00:00Z', rating: 3, helpfulVotes: 5 }),
    makeReview({ id: '2', createdAt: '2026-01-20T00:00:00Z', rating: 5, helpfulVotes: 1 }),
    makeReview({ id: '3', createdAt: '2026-01-15T00:00:00Z', rating: 1, helpfulVotes: 10 }),
  ];

  it('sorts newest first', () => {
    const sorted = sortReviews(reviews, 'newest');
    expect(sorted.map((r) => r.id)).toEqual(['2', '3', '1']);
  });

  it('sorts oldest first', () => {
    const sorted = sortReviews(reviews, 'oldest');
    expect(sorted.map((r) => r.id)).toEqual(['1', '3', '2']);
  });

  it('sorts highest rated first', () => {
    const sorted = sortReviews(reviews, 'highest');
    expect(sorted.map((r) => r.id)).toEqual(['2', '1', '3']);
  });

  it('sorts lowest rated first', () => {
    const sorted = sortReviews(reviews, 'lowest');
    expect(sorted.map((r) => r.id)).toEqual(['3', '1', '2']);
  });

  it('sorts most helpful first', () => {
    const sorted = sortReviews(reviews, 'most-helpful');
    expect(sorted.map((r) => r.id)).toEqual(['3', '1', '2']);
  });
});

describe('createReview', () => {
  it('creates a review with correct fields', () => {
    const review = createReview(
      {
        authorName: ' Alice ',
        authorEmail: ' Alice@Example.COM ',
        rating: 4,
        title: ' Great product ',
        body: ' I love this item very much ',
      },
      'product-1'
    );

    expect(review.productId).toBe('product-1');
    expect(review.authorName).toBe('Alice');
    expect(review.authorEmail).toBe('alice@example.com');
    expect(review.rating).toBe(4);
    expect(review.title).toBe('Great product');
    expect(review.body).toBe('I love this item very much');
    expect(review.helpfulVotes).toBe(0);
    expect(review.id).toBeTruthy();
    expect(review.createdAt).toBeTruthy();
  });
});

describe('incrementHelpfulVote', () => {
  it('returns a new review with incremented votes', () => {
    const original = makeReview({ helpfulVotes: 3 });
    const updated = incrementHelpfulVote(original);
    expect(updated.helpfulVotes).toBe(4);
    expect(original.helpfulVotes).toBe(3); // immutable
  });
});
