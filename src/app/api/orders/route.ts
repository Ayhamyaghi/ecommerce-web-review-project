import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, successResponse, getSessionToken, zodErrorResponse } from '@/lib/api-utils';
import { getSessionUser, requireAuth } from '@/lib/auth/session';
import { checkoutSchema } from '@/lib/schemas/order';
import { listOrders, checkout } from '@/lib/services/order-service';
import { AppError } from '@/lib/errors';
import { ZodError } from 'zod';

function getCartSessionId(request: NextRequest): string {
  const token = getSessionToken(request);
  if (token) {
    const user = getSessionUser(token);
    if (user) return user.id;
  }
  return request.cookies.get('guest_id')?.value || 'guest-default';
}

export async function GET(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const user = await requireAuth();
    return listOrders(user.id);
  });
}

export async function POST(request: NextRequest) {
  seedDatabase();
  try {
    const body = await request.json();
    const input = checkoutSchema.parse(body);
    const sessionId = getCartSessionId(request);
    const token = getSessionToken(request);
    const user = getSessionUser(token);
    const userId = user?.id ?? null;
    const result = checkout(sessionId, userId, input);
    return successResponse(result, 201);
  } catch (err) {
    if (err instanceof ZodError) return zodErrorResponse(err);
    if (err instanceof AppError)
      return Response.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    return Response.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'An error occurred' } },
      { status: 500 },
    );
  }
}
