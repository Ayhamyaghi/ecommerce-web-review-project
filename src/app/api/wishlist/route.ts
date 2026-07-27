import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, errorResponse } from '@/lib/api-utils';
import { requireAuth } from '@/lib/auth/session';
import { getWishlist, addToWishlist, removeFromWishlist } from '@/lib/services/wishlist-service';
import { wishlistProductSchema } from '@/lib/schemas/wishlist';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const user = await requireAuth();
    return getWishlist(user.id);
  });
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
    const user = await requireAuth();
    const { productId } = wishlistProductSchema.parse(body);
    return addToWishlist(user.id, productId);
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
    const user = await requireAuth();
    const { productId } = wishlistProductSchema.parse(body);
    return removeFromWishlist(user.id, productId);
  });
}
