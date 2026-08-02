import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, resolveCartSessionId } from '@/lib/api-utils';
import { getSessionUser } from '@/lib/auth/session';
import { addToCartSchema, updateCartItemSchema } from '@/lib/schemas/cart';
import { addToCart, updateCartItem, removeCartItem } from '@/lib/services/cart-service';

export async function POST(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const sessionId = resolveCartSessionId(request, getSessionUser);
    const body = await request.json();
    const input = addToCartSchema.parse(body);
    return addToCart(sessionId, input.productId, input.quantity);
  });
}

export async function PUT(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const sessionId = resolveCartSessionId(request, getSessionUser);
    const body = await request.json();
    const input = updateCartItemSchema.parse(body);
    return updateCartItem(sessionId, input.productId, input.quantity);
  });
}

export async function DELETE(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const sessionId = resolveCartSessionId(request, getSessionUser);
    const body = await request.json();
    const { productId } = body;
    return removeCartItem(sessionId, productId);
  });
}
