import { NextRequest } from 'next/server';
import { ZodError } from 'zod';
import { AppError } from './errors';

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiErrorBody;

export function successResponse<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data } satisfies ApiSuccess<T>, { status });
}

export function errorResponse(error: AppError): Response {
  return Response.json(
    {
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details ? { details: error.details } : {}),
      },
    } satisfies ApiErrorBody,
    { status: error.statusCode },
  );
}

export function zodErrorResponse(error: ZodError): Response {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.');
    if (!fieldErrors[path]) fieldErrors[path] = issue.message;
  }
  return Response.json(
    {
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: { fields: fieldErrors },
      },
    } satisfies ApiErrorBody,
    { status: 400 },
  );
}

export async function handleApiRoute<T>(
  handler: () => Promise<T>,
): Promise<Response> {
  try {
    const data = await handler();
    return successResponse(data);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof AppError) return errorResponse(err);
    console.error('Unhandled API error:', err);
    return Response.json(
      {
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
      } satisfies ApiErrorBody,
      { status: 500 },
    );
  }
}

export function getSessionToken(request: NextRequest): string | null {
  return request.cookies.get('session')?.value ?? null;
}

/**
 * Resolve the cart session ID for a request.
 *
 * Authenticated users are keyed by their user ID so their cart persists
 * across sessions. Guests are keyed by a cookie value, falling back to a
 * static default when the cookie is absent.
 *
 * Accepts a `getUser` callback so callers can supply the session-lookup
 * function without creating a circular import from this module into
 * auth/session.  Typical usage:
 *
 *   import { getSessionUser } from '@/lib/auth/session';
 *   const sessionId = resolveCartSessionId(request, getSessionUser);
 */
export function resolveCartSessionId(
  request: NextRequest,
  getUser: (token: string | null) => { id: string } | null,
): string {
  const token = getSessionToken(request);
  if (token) {
    const user = getUser(token);
    if (user) return user.id;
  }
  return request.cookies.get('guest_id')?.value || 'guest-default';
}
