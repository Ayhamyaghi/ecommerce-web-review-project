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
 * Parses the JSON body of a request.
 * Returns `{ ok: true, body }` on success, or `{ ok: false, response }` with
 * a 400 VALIDATION_ERROR response when the body is not valid JSON.
 */
export async function parseJsonBody(
  request: Request,
): Promise<{ ok: true; body: unknown } | { ok: false; response: Response }> {
  try {
    const body = await request.json();
    return { ok: true, body };
  } catch {
    const response: Response = Response.json(
      {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request body must be valid JSON',
        },
      } satisfies ApiErrorBody,
      { status: 400 },
    );
    return { ok: false, response };
  }
}
