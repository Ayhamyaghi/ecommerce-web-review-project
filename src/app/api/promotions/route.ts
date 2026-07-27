import { NextRequest } from 'next/server';
import { seedDatabase } from '@/lib/db/seed';
import { handleApiRoute, errorResponse } from '@/lib/api-utils';
import { requireAdmin } from '@/lib/auth/session';
import { createPromotionSchema } from '@/lib/schemas/promotion';
import { listPromotions, createPromotion } from '@/lib/services/promotion-service';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  seedDatabase();
  return handleApiRoute(async () => {
    await requireAdmin();
    return listPromotions();
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
    await requireAdmin();
    const input = createPromotionSchema.parse(body);
    return createPromotion(input);
  });
}
