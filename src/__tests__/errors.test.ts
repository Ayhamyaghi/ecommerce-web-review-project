import { describe, it, expect } from 'vitest';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  StockLimitError,
  PaymentError,
} from '@/lib/errors';

describe('AppError', () => {
  it('creates error with all fields', () => {
    const err = new AppError('INTERNAL_ERROR', 'something broke', 500, { key: 'val' });
    expect(err.code).toBe('INTERNAL_ERROR');
    expect(err.message).toBe('something broke');
    expect(err.statusCode).toBe(500);
    expect(err.details).toEqual({ key: 'val' });
    expect(err.name).toBe('AppError');
  });

  it('defaults statusCode to 500', () => {
    const err = new AppError('INTERNAL_ERROR', 'oops');
    expect(err.statusCode).toBe(500);
  });

  it('is an instance of Error', () => {
    const err = new AppError('INTERNAL_ERROR', 'oops');
    expect(err).toBeInstanceOf(Error);
  });
});

describe('ValidationError', () => {
  it('sets code to VALIDATION_ERROR and status 400', () => {
    const err = new ValidationError('bad input', { fields: { name: 'required' } });
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('bad input');
    expect(err.details).toEqual({ fields: { name: 'required' } });
  });

  it('works without details', () => {
    const err = new ValidationError('bad input');
    expect(err.details).toBeUndefined();
  });
});

describe('AuthenticationError', () => {
  it('sets code to AUTHENTICATION_REQUIRED and status 401', () => {
    const err = new AuthenticationError();
    expect(err.code).toBe('AUTHENTICATION_REQUIRED');
    expect(err.statusCode).toBe(401);
    expect(err.message).toBe('Authentication required');
  });

  it('accepts custom message', () => {
    const err = new AuthenticationError('Token expired');
    expect(err.message).toBe('Token expired');
  });
});

describe('AuthorizationError', () => {
  it('sets code to AUTHORIZATION_DENIED and status 403', () => {
    const err = new AuthorizationError();
    expect(err.code).toBe('AUTHORIZATION_DENIED');
    expect(err.statusCode).toBe(403);
    expect(err.message).toBe('Access denied');
  });

  it('accepts custom message', () => {
    const err = new AuthorizationError('Admin only');
    expect(err.message).toBe('Admin only');
  });
});

describe('NotFoundError', () => {
  it('sets code to NOT_FOUND and status 404', () => {
    const err = new NotFoundError('Product', 'abc-123');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toBe("Product 'abc-123' not found");
  });

  it('handles resource without id', () => {
    const err = new NotFoundError('Cart item');
    expect(err.message).toBe('Cart item not found');
  });
});

describe('ConflictError', () => {
  it('sets code to CONFLICT and status 409', () => {
    const err = new ConflictError('Email already exists');
    expect(err.code).toBe('CONFLICT');
    expect(err.statusCode).toBe(409);
    expect(err.message).toBe('Email already exists');
  });
});

describe('StockLimitError', () => {
  it('sets code to STOCK_LIMIT and status 422', () => {
    const err = new StockLimitError('Only 3 left', { productId: 'p1', available: 3 });
    expect(err.code).toBe('STOCK_LIMIT');
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual({ productId: 'p1', available: 3 });
  });
});

describe('PaymentError', () => {
  it('sets code to PAYMENT_FAILED and status 422', () => {
    const err = new PaymentError('Card declined', { reason: 'insufficient_funds' });
    expect(err.code).toBe('PAYMENT_FAILED');
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual({ reason: 'insufficient_funds' });
  });
});
