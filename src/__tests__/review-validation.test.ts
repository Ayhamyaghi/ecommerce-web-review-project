import { describe, it, expect } from 'vitest';
import {
  validateRating,
  validateAuthorName,
  validateAuthorEmail,
  validateTitle,
  validateBody,
  sanitizeText,
  isDuplicateReview,
  validateReviewForm,
} from '../lib/review-validation';
import type { Review } from '../lib/types';

describe('validateRating', () => {
  it('accepts integers 1 through 5', () => {
    for (let i = 1; i <= 5; i++) {
      expect(validateRating(i)).toBeNull();
    }
  });

  it('rejects 0 and 6', () => {
    expect(validateRating(0)).not.toBeNull();
    expect(validateRating(6)).not.toBeNull();
  });

  it('rejects fractional numbers', () => {
    expect(validateRating(3.5)).toBe('Rating must be a whole number');
  });

  it('rejects NaN', () => {
    expect(validateRating(NaN)).toBe('Rating is required');
  });

  it('rejects negative numbers', () => {
    expect(validateRating(-1)).not.toBeNull();
  });
});

describe('validateAuthorName', () => {
  it('accepts valid names', () => {
    expect(validateAuthorName('Alice')).toBeNull();
    expect(validateAuthorName('Jo')).toBeNull(); // min length
  });

  it('rejects empty or whitespace-only strings', () => {
    expect(validateAuthorName('')).toBe('Name is required');
    expect(validateAuthorName('   ')).toBe('Name is required');
  });

  it('rejects names shorter than 2 characters', () => {
    expect(validateAuthorName('A')).toBe('Name must be at least 2 characters');
  });

  it('rejects names without letters', () => {
    expect(validateAuthorName('123')).toBe('Name must contain at least one letter');
  });

  it('rejects names over 50 characters', () => {
    expect(validateAuthorName('A'.repeat(51))).toBe('Name must be 50 characters or fewer');
  });
});

describe('validateAuthorEmail', () => {
  it('accepts valid emails', () => {
    expect(validateAuthorEmail('user@example.com')).toBeNull();
  });

  it('rejects empty email', () => {
    expect(validateAuthorEmail('')).toBe('Email is required');
  });

  it('rejects email without @', () => {
    expect(validateAuthorEmail('userexample.com')).toBe('Email must contain a valid @ symbol');
  });

  it('rejects email without domain dot', () => {
    expect(validateAuthorEmail('user@localhost')).toBe('Email must have a valid domain');
  });
});

describe('validateTitle', () => {
  it('accepts valid titles', () => {
    expect(validateTitle('Great product')).toBeNull();
  });

  it('rejects titles shorter than 3 characters', () => {
    expect(validateTitle('OK')).toBe('Title must be at least 3 characters');
  });

  it('rejects titles over 100 characters', () => {
    expect(validateTitle('A'.repeat(101))).toBe('Title must be 100 characters or fewer');
  });
});

describe('validateBody', () => {
  it('accepts valid body text', () => {
    expect(validateBody('This is a great product and I love it!')).toBeNull();
  });

  it('rejects body shorter than 10 characters', () => {
    expect(validateBody('Short')).toBe('Review must be at least 10 characters');
  });

  it('rejects whitespace-only body', () => {
    expect(validateBody('          ')).toBe('Review body is required');
  });

  it('rejects body over 2000 characters', () => {
    expect(validateBody('A'.repeat(2001))).toBe('Review must be 2000 characters or fewer');
  });
});

describe('sanitizeText', () => {
  it('strips HTML-like tags', () => {
    expect(sanitizeText('Hello <script>alert("xss")</script> world')).toBe('Hello alert("xss") world');
  });

  it('collapses excessive newlines', () => {
    expect(sanitizeText('line1\n\n\n\n\nline2')).toBe('line1\n\nline2');
  });

  it('trims whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });
});

describe('isDuplicateReview', () => {
  const existing: Review[] = [
    {
      id: '1',
      productId: 'product-1',
      authorName: 'Alice',
      authorEmail: 'alice@example.com',
      rating: 5,
      title: 'Great',
      body: 'Loved this product very much',
      createdAt: '2026-01-01T00:00:00Z',
      helpfulVotes: 0,
    },
  ];

  it('detects duplicate by email and product (case-insensitive)', () => {
    expect(isDuplicateReview(existing, 'Alice@Example.COM', 'product-1')).toBe(true);
  });

  it('allows same email for different product', () => {
    expect(isDuplicateReview(existing, 'alice@example.com', 'product-2')).toBe(false);
  });

  it('allows different email for same product', () => {
    expect(isDuplicateReview(existing, 'bob@example.com', 'product-1')).toBe(false);
  });
});

describe('validateReviewForm', () => {
  it('returns empty array for valid data', () => {
    const errors = validateReviewForm({
      rating: 4,
      authorName: 'Alice',
      authorEmail: 'alice@example.com',
      title: 'Great product',
      body: 'I really enjoyed using this product',
    });
    expect(errors).toEqual([]);
  });

  it('returns multiple errors for completely invalid data', () => {
    const errors = validateReviewForm({
      rating: 0,
      authorName: '',
      authorEmail: '',
      title: '',
      body: '',
    });
    expect(errors.length).toBe(5);
    expect(errors.map((e) => e.field)).toEqual([
      'rating', 'authorName', 'authorEmail', 'title', 'body',
    ]);
  });
});
