import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, getSessionToken, errorResponse } from '@/lib/api-utils';
import { getSessionUser, requireAuth } from '@/lib/auth/session';
import { reviewQuerySchema, createReviewSchema } from '@/lib/schemas/review';
import { getProductReviews, listAllReviews, createReview } from '@/lib/services/review-service';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    const params: Record<string, string> = {};
    request.nextUrl.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    const query = reviewQuerySchema.parse(params);
    const token = getSessionToken(request);
    const user = getSessionUser(token);
    if (query.productId) {
      return getProductReviews(query.productId, query, user?.id);
    }
    return listAllReviews(query);
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
    const input = createReviewSchema.parse(body);
    return createReview(user.id, user.name, input);
  });
}
