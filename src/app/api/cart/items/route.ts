import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, getSessionToken, errorResponse } from '@/lib/api-utils';
import { getSessionUser } from '@/lib/auth/session';
import { addToCartSchema, updateCartItemSchema, removeCartItemSchema } from '@/lib/schemas/cart';
import { addToCart, updateCartItem, removeCartItem } from '@/lib/services/cart-service';
import { ValidationError } from '@/lib/errors';

function getCartSessionId(request: NextRequest): string {
  const token = getSessionToken(request);
  if (token) {
    const user = getSessionUser(token);
    if (user) return user.id;
  }
  return request.cookies.get('guest_id')?.value || 'guest-default';
}

export async function POST(request: NextRequest) {
  seedDatabase();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(new ValidationError('Request body must be valid JSON'));
  }

  return handleApiRoute(async () => {
    const sessionId = getCartSessionId(request);
    const input = addToCartSchema.parse(body);
    return addToCart(sessionId, input.productId, input.quantity);
  });
}

export async function PUT(request: NextRequest) {
  seedDatabase();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(new ValidationError('Request body must be valid JSON'));
  }

  return handleApiRoute(async () => {
    const sessionId = getCartSessionId(request);
    const input = updateCartItemSchema.parse(body);
    return updateCartItem(sessionId, input.productId, input.quantity);
  });
}

export async function DELETE(request: NextRequest) {
  seedDatabase();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse(new ValidationError('Request body must be valid JSON'));
  }

  return handleApiRoute(async () => {
    const sessionId = getCartSessionId(request);
    const { productId } = removeCartItemSchema.parse(body);
    return removeCartItem(sessionId, productId);
  });
}
