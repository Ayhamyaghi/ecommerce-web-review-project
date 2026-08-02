import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, resolveCartSessionId } from '@/lib/api-utils';
import { getSessionUser } from '@/lib/auth/session';
import { getCart, clearCart } from '@/lib/services/cart-service';

export async function GET(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const sessionId = resolveCartSessionId(request, getSessionUser);
    return getCart(sessionId);
  });
}

export async function DELETE(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const sessionId = resolveCartSessionId(request, getSessionUser);
    clearCart(sessionId);
    return { message: 'Cart cleared' };
  });
}
