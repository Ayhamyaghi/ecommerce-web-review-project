import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, getSessionToken } from '@/lib/api-utils';
import { getSessionUser } from '@/lib/auth/session';
import { getCart, clearCart } from '@/lib/services/cart-service';

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
    const sessionId = getCartSessionId(request);
    return getCart(sessionId);
  });
}

export async function DELETE(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const sessionId = getCartSessionId(request);
    clearCart(sessionId);
    return { message: 'Cart cleared' };
  });
}
