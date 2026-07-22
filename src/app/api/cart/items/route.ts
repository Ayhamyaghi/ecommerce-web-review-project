import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, getSessionToken } from '@/lib/api-utils';
import { getSessionUser } from '@/lib/auth/session';
import { addToCartSchema, updateCartItemSchema } from '@/lib/schemas/cart';
import { addToCart, updateCartItem, removeCartItem } from '@/lib/services/cart-service';

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
  return handleApiRoute(async () => {
    const sessionId = getCartSessionId(request);
    const body = await request.json();
    const input = addToCartSchema.parse(body);
    return addToCart(sessionId, input.productId, input.quantity);
  });
}

export async function PUT(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const sessionId = getCartSessionId(request);
    const body = await request.json();
    const input = updateCartItemSchema.parse(body);
    return updateCartItem(sessionId, input.productId, input.quantity);
  });
}

export async function DELETE(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const sessionId = getCartSessionId(request);
    const body = await request.json();
    const { productId } = body;
    return removeCartItem(sessionId, productId);
  });
}
