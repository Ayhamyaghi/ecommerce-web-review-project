import { describe, it, expect } from 'vitest';
import { ZodError, z } from 'zod';
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
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
  handleApiRoute,
} from '@/lib/api-utils';

// ---------------------------------------------------------------------------
// Error classes
// ---------------------------------------------------------------------------

describe('AppError subclasses', () => {
  it('ValidationError has code VALIDATION_ERROR and status 400', () => {
    const err = new ValidationError('bad input');
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe('bad input');
    expect(err instanceof AppError).toBe(true);
  });

  it('AuthenticationError has code AUTHENTICATION_REQUIRED and status 401', () => {
    const err = new AuthenticationError();
    expect(err.code).toBe('AUTHENTICATION_REQUIRED');
    expect(err.statusCode).toBe(401);
  });

  it('AuthenticationError accepts custom message', () => {
    const err = new AuthenticationError('Token expired');
    expect(err.message).toBe('Token expired');
  });

  it('AuthorizationError has code AUTHORIZATION_DENIED and status 403', () => {
    const err = new AuthorizationError();
    expect(err.code).toBe('AUTHORIZATION_DENIED');
    expect(err.statusCode).toBe(403);
  });

  it('NotFoundError has code NOT_FOUND and status 404', () => {
    const err = new NotFoundError('Product', 'prod-1');
    expect(err.code).toBe('NOT_FOUND');
    expect(err.statusCode).toBe(404);
    expect(err.message).toContain('prod-1');
  });

  it('NotFoundError without id omits id from message', () => {
    const err = new NotFoundError('Cart item');
    expect(err.message).toBe('Cart item not found');
  });

  it('ConflictError has code CONFLICT and status 409', () => {
    const err = new ConflictError('Email already exists');
    expect(err.code).toBe('CONFLICT');
    expect(err.statusCode).toBe(409);
  });

  it('StockLimitError has code STOCK_LIMIT and status 422', () => {
    const err = new StockLimitError('Only 3 available', { available: 3 });
    expect(err.code).toBe('STOCK_LIMIT');
    expect(err.statusCode).toBe(422);
    expect(err.details).toEqual({ available: 3 });
  });

  it('PaymentError has code PAYMENT_FAILED and status 422', () => {
    const err = new PaymentError('Card declined');
    expect(err.code).toBe('PAYMENT_FAILED');
    expect(err.statusCode).toBe(422);
  });
});

// ---------------------------------------------------------------------------
// Response helpers
// ---------------------------------------------------------------------------

describe('successResponse', () => {
  it('returns 200 by default with success:true and data', async () => {
    const res = successResponse({ id: '1', name: 'Widget' });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ id: '1', name: 'Widget' });
  });

  it('uses provided status code', async () => {
    const res = successResponse({ created: true }, 201);
    expect(res.status).toBe(201);
  });
});

describe('errorResponse', () => {
  it('maps AppError code and statusCode correctly', async () => {
    const err = new NotFoundError('Order', 'ord-99');
    const res = errorResponse(err);
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('NOT_FOUND');
    expect(json.error.message).toContain('ord-99');
  });

  it('includes details when present', async () => {
    const err = new StockLimitError('Out of stock', { available: 0 });
    const res = errorResponse(err);
    const json = await res.json();
    expect(json.error.details).toEqual({ available: 0 });
  });

  it('omits details when not provided', async () => {
    const err = new AuthenticationError();
    const res = errorResponse(err);
    const json = await res.json();
    expect(json.error.details).toBeUndefined();
  });

  it('returns 401 for AuthenticationError', async () => {
    const res = errorResponse(new AuthenticationError());
    expect(res.status).toBe(401);
  });

  it('returns 403 for AuthorizationError', async () => {
    const res = errorResponse(new AuthorizationError('Admin only'));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error.code).toBe('AUTHORIZATION_DENIED');
  });

  it('returns 409 for ConflictError', async () => {
    const res = errorResponse(new ConflictError('Duplicate email'));
    expect(res.status).toBe(409);
  });

  it('returns 422 for StockLimitError', async () => {
    const res = errorResponse(new StockLimitError('Stock exceeded'));
    expect(res.status).toBe(422);
  });
});

describe('zodErrorResponse', () => {
  function makeZodError(schema: z.ZodTypeAny, value: unknown): ZodError {
    const result = schema.safeParse(value);
    if (!result.success) return result.error;
    throw new Error('Expected parse to fail');
  }

  const schema = z.object({
    email: z.string().email(),
    age: z.number().int().min(0),
  });

  it('returns 400 with VALIDATION_ERROR code', async () => {
    const err = makeZodError(schema, { email: 'bad', age: -1 });
    const res = zodErrorResponse(err);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error.code).toBe('VALIDATION_ERROR');
    expect(json.error.message).toBe('Validation failed');
  });

  it('includes field errors in details', async () => {
    const err = makeZodError(schema, { email: 'not-email', age: -5 });
    const res = zodErrorResponse(err);
    const json = await res.json();
    expect(json.error.details.fields).toBeDefined();
    expect(typeof json.error.details.fields.email).toBe('string');
    expect(typeof json.error.details.fields.age).toBe('string');
  });

  it('uses dot-separated path for nested fields', async () => {
    const nested = z.object({ address: z.object({ city: z.string().min(1) }) });
    const err = makeZodError(nested, { address: { city: '' } });
    const res = zodErrorResponse(err);
    const json = await res.json();
    expect(json.error.details.fields['address.city']).toBeDefined();
  });
});

// ---------------------------------------------------------------------------
// handleApiRoute
// ---------------------------------------------------------------------------

describe('handleApiRoute', () => {
  it('wraps successful return value in successResponse', async () => {
    const res = await handleApiRoute(async () => ({ ok: true }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data).toEqual({ ok: true });
  });

  it('handles ZodError and returns 400', async () => {
    const res = await handleApiRoute(async () => {
      z.string().email().parse('not-an-email');
    });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('handles AppError and maps statusCode', async () => {
    const res = await handleApiRoute(async () => {
      throw new NotFoundError('Widget', 'w-1');
    });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.error.code).toBe('NOT_FOUND');
  });

  it('handles AuthenticationError with 401', async () => {
    const res = await handleApiRoute(async () => {
      throw new AuthenticationError();
    });
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error.code).toBe('AUTHENTICATION_REQUIRED');
  });

  it('handles StockLimitError with 422', async () => {
    const res = await handleApiRoute(async () => {
      throw new StockLimitError('Only 2 left', { available: 2 });
    });
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe('STOCK_LIMIT');
  });

  it('handles unknown errors with 500 INTERNAL_ERROR', async () => {
    const res = await handleApiRoute(async () => {
      throw new Error('Unexpected database failure');
    });
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe('INTERNAL_ERROR');
    expect(json.success).toBe(false);
  });

  it('does not leak error message for unknown errors', async () => {
    const res = await handleApiRoute(async () => {
      throw new Error('Secret internal failure details');
    });
    const json = await res.json();
    expect(json.error.message).not.toContain('Secret');
  });
});
