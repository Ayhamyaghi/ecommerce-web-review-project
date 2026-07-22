import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth/session';
import { getWishlist, addToWishlist, removeFromWishlist } from '@/lib/services/wishlist-service';

export async function GET(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const user = await requireAuth();
    return getWishlist(user.id);
  });
}

export async function POST(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const body = await request.json();
    const { productId } = body;
    return addToWishlist(user.id, productId);
  });
}

export async function DELETE(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const user = await requireAuth();
    const body = await request.json();
    const { productId } = body;
    return removeFromWishlist(user.id, productId);
  });
}
