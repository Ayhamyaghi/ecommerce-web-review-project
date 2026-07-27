import { describe, it, expect, vi } from 'vitest';
import { ZodError, z } from 'zod';
import { ValidationError, AuthenticationError, NotFoundError } from '@/lib/errors';
import {
  successResponse,
  errorResponse,
  zodErrorResponse,
  handleApiRoute,
} from '@/lib/api-utils';

async function parseBody(response: Response) {
  return response.json();
}

describe('successResponse', () => {
  it('returns 200 with success body by default', async () => {
    const res = successResponse({ id: 1, name: 'test' });
    expect(res.status).toBe(200);
    const body = await parseBody(res);
    expect(body).toEqual({ success: true, data: { id: 1, name: 'test' } });
  });

  it('accepts custom status code', async () => {
    const res = successResponse({ created: true }, 201);
    expect(res.status).toBe(201);
  });

  it('handles null data', async () => {
    const res = successResponse(null);
    const body = await parseBody(res);
    expect(body).toEqual({ success: true, data: null });
  });

  it('handles array data', async () => {
    const res = successResponse([1, 2, 3]);
    const body = await parseBody(res);
    expect(body.data).toEqual([1, 2, 3]);
  });
});

describe('errorResponse', () => {
  it('returns proper error body for AppError', async () => {
    const err = new NotFoundError('Product', 'xyz');
    const res = errorResponse(err);
    expect(res.status).toBe(404);
    const body = await parseBody(res);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('xyz');
  });

  it('includes details when present', async () => {
    const err = new ValidationError('bad', { fields: { name: 'required' } });
    const res = errorResponse(err);
    const body = await parseBody(res);
    expect(body.error.details).toEqual({ fields: { name: 'required' } });
  });

  it('omits details when not present', async () => {
    const err = new AuthenticationError();
    const res = errorResponse(err);
    const body = await parseBody(res);
    expect(body.error.details).toBeUndefined();
  });
});

describe('zodErrorResponse', () => {
  it('maps Zod issues to field errors', async () => {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
    });
    let zodErr: ZodError | null = null;
    try { schema.parse({ name: '', email: 'bad' }); }
    catch (e) { zodErr = e as ZodError; }
    expect(zodErr).not.toBeNull();
    const res = zodErrorResponse(zodErr!);
    expect(res.status).toBe(400);
    const body = await parseBody(res);
    expect(body.success).toBe(false);
    expect(body.error.code).toBe('VALIDATION_ERROR');
    expect(body.error.details.fields).toHaveProperty('name');
    expect(body.error.details.fields).toHaveProperty('email');
  });

  it('takes first error per field path', async () => {
    const schema = z.object({ age: z.number().min(0).max(150) });
    let zodErr: ZodError | null = null;
    try { schema.parse({ age: 'not a number' }); }
    catch (e) { zodErr = e as ZodError; }
    const res = zodErrorResponse(zodErr!);
    const body = await parseBody(res);
    expect(typeof body.error.details.fields.age).toBe('string');
  });
});

describe('handleApiRoute', () => {
  it('returns successResponse for resolved handler', async () => {
    const res = await handleApiRoute(async () => ({ id: 1 }));
    expect(res.status).toBe(200);
    const body = await parseBody(res);
    expect(body.success).toBe(true);
    expect(body.data).toEqual({ id: 1 });
  });

  it('handles ZodError thrown by handler', async () => {
    const schema = z.object({ name: z.string().min(5) });
    const res = await handleApiRoute(async () => {
      schema.parse({ name: 'ab' });
    });
    expect(res.status).toBe(400);
    const body = await parseBody(res);
    expect(body.error.code).toBe('VALIDATION_ERROR');
  });

  it('handles AppError thrown by handler', async () => {
    const res = await handleApiRoute(async () => {
      throw new NotFoundError('Order', 'ORD-123');
    });
    expect(res.status).toBe(404);
    const body = await parseBody(res);
    expect(body.error.code).toBe('NOT_FOUND');
    expect(body.error.message).toContain('ORD-123');
  });

  it('handles AuthenticationError', async () => {
    const res = await handleApiRoute(async () => {
      throw new AuthenticationError();
    });
    expect(res.status).toBe(401);
  });

  it('handles unexpected errors with 500', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await handleApiRoute(async () => {
      throw new Error('DB connection failed');
    });
    expect(res.status).toBe(500);
    const body = await parseBody(res);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    expect(body.error.message).toBe('An unexpected error occurred');
    spy.mockRestore();
  });

  it('does not leak internal error details for unexpected errors', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = await handleApiRoute(async () => {
      throw new Error('secret database password exposed');
    });
    const body = await parseBody(res);
    expect(body.error.message).not.toContain('secret');
    spy.mockRestore();
  });
});
